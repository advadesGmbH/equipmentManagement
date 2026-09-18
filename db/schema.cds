namespace com.advades.fleetmanagement;

using { cuid, managed } from '@sap/cds/common';

entity ActionLogs : cuid, managed {
    actionType      : String(100) not null;  // z.B. 'uploadDocumentForAi'
    status          : String(20) default 'pending';  // pending, success, error
    referenceEntity : String(100);           // z.B. 'WallboxInvoice', später weitere
    referenceId     : UUID;                  // Fremdschlüssel zum fachlichen Objekt
    requestPayload  : LargeString;           // was gesendet wurde (z.B. an AI Core)
    responsePayload : LargeString;           // Antwort des Aufrufs
    errorMessage    : LargeString;
}