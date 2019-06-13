import { BlacklistModel, Blacklist } from '../../models/Blacklist';
import { Request, Response } from 'express';

export class BlacklistController{

    public async addToBlacklist (req: Request, res: Response) {                
        let customer = new BlacklistModel(req.body);

        const blacklistRegistry = await BlacklistModel.findOne({ cpf: req.body.cpf });

        if (blacklistRegistry) {
            res.json({ message: 'CPF já cadastrado na blacklist!' });
            return;
        } else {
            customer.save(async (err, customer) => {
                if(err){
                    res.send(err);
                }
    
                res.json(customer);
            });
        }

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