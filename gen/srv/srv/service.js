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
});