import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const contactController: {
    createContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getContacts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getContactById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkCreateContacts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    createContactGroup(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getContactGroups(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getContactGroupById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateContactGroup(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteContactGroup(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    addContactsToGroup(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    removeContactsFromGroup(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    searchContacts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllTags(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getContactStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    performBulkOperation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    importContacts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    exportContacts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    findDuplicates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    mergeDuplicates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=contactController.d.ts.map