import { BlacklistModel, Blacklist } from '../models/Blacklist';
import { Request, Response } from 'express';

export class BlacklistController{

    public addToBlacklist (req: Request, res: Response) {                
        let customer = new BlacklistModel(req.body);

        customer.save(async (err, customer) => {
            if(err){
                res.send(err);
            }

            res.json(customer);
        });
    }

    public getBlacklist (req: Request, res: Response) {           
        BlacklistModel.find({}, (err, customer) => {
            if(err){
                res.send(err);
            }
            res.json(customer);
        });
    }

    public deleteFromBlacklist (req: Request, res: Response) {           
        BlacklistModel.remove({ _id: req.params.customerCpf }, (err) => {
            if(err){
                res.send(err);
            }
            res.json({ message: 'Successfully deleted from Blacklist!'});
        });
    }
    
}