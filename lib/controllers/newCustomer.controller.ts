import { CustomerModel } from '../../models/Customer';
import { NewCustomerModel, NewCustomer } from '../../models/NewCustomer';
import { BlacklistModel } from '../../models/Blacklist';
import { Request, Response } from 'express';
import { sendEmail } from '../../helpers/sendGrid';

function getBlacklistQuery(newCustomer: NewCustomer) {
    if (newCustomer.type === 'company') {
      return { cnpj: newCustomer.companyInfo.cnpj };
    }
  
    return { cpf: newCustomer.personalInfo.cpf };
}

export class NewCustomerController{

    public addNewCustomer (req: Request, res: Response) {                
        let newCustomer = new NewCustomerModel(req.body);
    
        newCustomer.save(async (err, customer) => {
            try {
                if(err){
                    res.send(err);
                }
                
                if (customer) {
                    const blacklistQuery = getBlacklistQuery(customer);
                    const blacklist = await BlacklistModel.findOne(blacklistQuery, { _id: 1 });
    
                    // verifica se cliente está na blacklist
                    if (blacklist) {
                        customer.status = 'refused';
                        customer.refusalReason = 'O CPF/CNPJ informado está na blacklist';
                    } else {
                        customer.status = 'preApproved';
                        sendEmail(customer);    
                    }
                
                    res.json(customer);
                    await customer.save();
                }
            } catch (error) {
                console.log('error :', error);
            }

        });
    }

    public getCustomers (req: Request, res: Response) {           
        NewCustomerModel.find({}, (err, customer) => {
            if(err){
                res.send(err);
            }
            res.json(customer);
        });
    }

    public getCustomerById (req: Request, res: Response) {           
        CustomerModel.findById(req.params.customerId, (err, customer) => {
            if(err){
                res.send(err);
            }
            res.json(customer);
        });
    }

    public updateCustomer (req: Request, res: Response) {           
        CustomerModel.findOneAndUpdate({ _id: req.params.customerId }, req.body, { new: true }, (err, customer) => {
            if(err){
                res.send(err);
            }
            res.json(customer);
        });
    }

    public deleteCustomer (req: Request, res: Response) {           
        CustomerModel.remove({ _id: req.params.customerId }, (err) => {
            if(err){
                res.send(err);
            }
            res.json({ message: 'Successfully deleted contact!'});
        });
    }
    
}