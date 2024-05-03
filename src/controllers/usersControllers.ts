import { Request, Response } from "express";
import { hashPassword } from "../services/password.services";
import prisma from "../models/userModel";


export const createUser = async (req: Request, res: Response):Promise<any> => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.create({
            data:{
                email,
                password: hashedPassword
            }
        })

        res.status(201).json({user});
        return user;
    } catch (error: any) {

        if(error.code === 'P2002' && error?.meta?.target?.include('email')){
            return res.status(400).json({message: "Email already exists"});
        }
        
        console.log(error);
        res.status(500).json({message: "Error creating user"});
        
    }

}

export const getAllUsers = async (req: Request, res: Response):Promise<any> => {
    try {
        const users = await prisma.findMany()
        res.status(200).json({users});



    } catch (error:any) {
        console.log(error);
        res.status(500).json({message: "Error getting users"});
        
    }

}

export const getUserById = async (req: Request, res: Response):Promise<any> => {

    const userId = parseInt(req.params.id);
    try {
        //const { id } = req.params;
        const user = await prisma.findUnique({where: {id: Number(userId)}})
        res.status(200).json({user});

        if(!user){
            res.status(404).json({message: "User not found"});
            return 
        }

        return user;


    } catch (error:any) {
        console.log(error);
        res.status(500).json({message: "Error getting user"});

    }

}
  

export const updateUser = async (req: Request, res: Response):Promise<any> => {
    const userId = parseInt(req.params.id);
    const { email,password } = req.body;
    try {

        let dataTopUpdate: any = {
            ...req.body
        }

        if (password) {
            //dataTopUpdate.password = await hashPassword(password);
            const hashedPassword = await hashPassword(password);
            dataTopUpdate.password = hashedPassword;
        }

        if (email) {
            dataTopUpdate.email = email;
        }

        const user = await prisma.update({
            where: {id:userId},
            data: dataTopUpdate
        })

        res.status(200).json({user});


    } catch (error:any) {

        if(error.code === 'P2002' && error?.meta?.target?.include('email')){
            return res.status(400).json({message: "Email already exists"});
        }
        else if(error.code === 'P2025'){
            return res.status(404).json({message: "User not found"});
        }
        else{
            console.log(error);
            res.status(500).json({message: "Error updating user"});
        }


    }

}

export const deleteUser = async (req: Request, res: Response):Promise<any> => {
    const userId = parseInt(req.params.id);
    try {
        const user = await prisma.delete({where: {id:userId}})
        res.status(200).json({
            message: `The user with id ${userId} has been deleted`
        }).end();

    } catch (error:any) {
        if (error?.code=="P2025"){
            res.status(404).json({message: "User not found"});
        }else{
            console.log(error);
            res.status(500).json({message: "Error deleting user"});
        }

    }
}