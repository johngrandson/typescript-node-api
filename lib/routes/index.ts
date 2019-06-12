import { Request, Response } from "express";
import { NewCustomerController } from "../controllers/newCustomer.controller";
import { BlacklistController } from "../controllers/blacklist.controller";

export class Routes { 
    
    public newCustomerController: NewCustomerController = new NewCustomerController() 
    public BlacklistController: BlacklistController = new BlacklistController() 
    
    public routes(app: any): void {
        
        // CUSTOMER ENDPOINTS

        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })
        
        app.route('/customer')
        .get(this.newCustomerController.getCustomers)        
        .post(this.newCustomerController.addNewCustomer);

        app.route('/customer/:customerId')
        .get(this.newCustomerController.getCustomerById)
        .put(this.newCustomerController.updateCustomer)
        .delete(this.newCustomerController.deleteCustomer)

        // BLACKLIST ENDPOINTS

        app.route('/testEndpoint')
            .get((req: Request, res: Response) => {            
                res.status(200).send({
                    message: 'Blacklist works!!!!'
                })
            })
        
        app.route('/blacklist')
            .get(this.BlacklistController.getBlacklist)        
            .post(this.BlacklistController.addToBlacklist);

        app.route('/blacklist/:customerId')
            .delete(this.BlacklistController.deleteFromBlacklist)
    }
}