import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
        email?: string;
        idDOB?: Uint8Array; // Verified DOB from ID document
        idName?: string; // Verified name from ID document
    }
}
