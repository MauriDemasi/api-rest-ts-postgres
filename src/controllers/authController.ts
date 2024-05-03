import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.services";
import prisma from "../models/userModel";
import { generateToken } from "../services/auth.services";

export const register = async (req:Request, res:Response): Promise <void>=>{

    const { email, password} = req.body;

    try {

        if(!email ||!password) {
            res.status(400).json({ error: "Los campos email y/o password, son obligatorios" });
            return;
        }
        const hashedPassword = await hashPassword(password);
        console.log(hashedPassword);

        const userModel = await prisma.create({
            data:{
                email,
                password: hashedPassword
            }
        });

        const token = generateToken(userModel);
        res.status(201).json({ token });


    } catch (error: any) {

        
        if (error?.code === "P2002" && error?.meta?.target.includes("email") ) {
            res.status(409).json({ error: "El email ya existe" });
            return;
        }
        
        //console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req:Request, res:Response):Promise<void> => {

    const { email, password} = req.body;

    try {

        if(!email ||!password) {
            res.status(400).json({ error: "Los campos email y/o password, no pueden estar vacios" });
            return;
        }
        
        const user = await prisma.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const passwordMatch = await comparePassword(password, user.password);

        if(!passwordMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = generateToken(user);
        res.status(200).json({ token });    

    } catch (error:any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
