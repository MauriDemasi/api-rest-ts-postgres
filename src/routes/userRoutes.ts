import express, { Request,Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersControllers";

const router= express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

//midleware de jwt para ver si estamos autenticados
const autenticateToken = (req: Request, res:Response, next:NextFunction) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.sendStatus(401).json({error: 'unauthorized'});
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if(err) {
            console.error(err, "error en la autenticacion");
            return res.status(403).json({error: 'no tienes acceso a este recurso'});
        }

        next();
    })

}



//Rutas
router.post('/', autenticateToken, createUser);
router.get('/', autenticateToken, getAllUsers);
router.get('/:id', autenticateToken, getUserById);
router.put('/:id', autenticateToken, updateUser);
router.delete('/:id', autenticateToken, deleteUser);


export default router;