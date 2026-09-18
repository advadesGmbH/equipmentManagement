require('dotenv').config();
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { ActionLogs } = this.entities;
    this.on('uploadDocumentForAi', async (req) => {
        const { document, fileName, mimeType } = req.data;
        const log = await INSERT.into(ActionLogs).entries({
            actionType: 'uploadDocumentForAi',
            status: 'pending',
            requestPayload: JSON.stringify({ fileName, mimeType })
        });

        // Platzhalter: hier kommt später der Aufruf des SAP AI Core SDK rein

        return SELECT.one.from(ActionLogs).where({ ID: log.ID });
    });

    this.on('checkAiCoreConnection', async (req) => {
        const startTime = Date.now();

        const logEntry = await INSERT.into(ActionLogs).entries({
            actionType: 'checkAiCoreConnection',
            status: 'pending',
            requestPayload: JSON.stringify({ message: 'Antworte kurz: Verbindung funktioniert.' })
        });

        try {
           const tokenResponse = await fetch(`${process.env.AICORE_AUTH_URL}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: process.env.AICORE_CLIENT_ID,
                    client_secret: process.env.AICORE_CLIENT_SECRET
                })
            });
            if (!tokenResponse.ok) {
                throw new Error(`Token-Request fehlgeschlagen: ${tokenResponse.status} ${await tokenResponse.text()}`);
            }

            const { access_token } = await tokenResponse.json();

            const deploymentId = 'd630fb2467fb5394';

            const completionResponse = await fetch(
                `${process.env.AICORE_BASE_URL}/v2/inference/deployments/${deploymentId}/completion`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'AI-Resource-Group': process.env.AICORE_RESOURCE_GROUP || 'default',
                        'Authorization': `Bearer ${access_token}`
                    },
                    body: JSON.stringify({
                        orchestration_config: {
                            module_configurations: {
                                llm_module_config: {
                                    model_name: 'gpt-4o-mini',
                                    model_params: {}
                                },
                                templating_module_config: {
                                    template: [
                                        { role: 'user', content: 'Antworte kurz: Verbindung funktioniert.' }
                                    ]
                                }
                            }
                        }
                    })
                }
            );

            const completionData = await completionResponse.json();

            if (!completionResponse.ok) {
                throw new Error(`Completion-Request fehlgeschlagen: ${completionResponse.status} ${JSON.stringify(completionData)}`);
            }

            await UPDATE(ActionLogs, logEntry.ID).with({
                status: 'success',
                responsePayload: JSON.stringify(completionData),
                durationMs: Date.now() - startTime
            });


        } catch (err) {
           await UPDATE(ActionLogs, logEntry.ID).with({
                status: 'error',
                errorMessage: err.message,
                durationMs: Date.now() - startTime
            });
            req.error(500, `AI Core Verbindungstest fehlgeschlagen: ${err.message}`);
        }

        return SELECT.one.from(ActionLogs).where({ ID: logEntry.ID });
    });
});