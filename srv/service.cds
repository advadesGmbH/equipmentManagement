using { com.advades.fleetmanagement as db } from '../db/schema';

service FleetService @(path: '/fleet') {

    entity ActionLogs as projection on db.ActionLogs;

    action checkAiCoreConnection() returns ActionLogs;

    action uploadDocumentForAi(
        document : LargeBinary,
        fileName : String,
        mimeType : String
    ) returns ActionLogs;
}