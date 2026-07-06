"use server";

import { db } from "@/lib/db";
import { currentUser } from "../../auth/actions/current-user";
import { TemplateFolder } from "../lib/path-to-json";




export const getPlaygroundById= async(id:string)=>{
    try {
        const playground = await db.playground.findUnique({
            where:{id},
            select:{
                templateFiles:{
                    select:{
                        content:true
                    }
                }
            }
        })
        return playground;
    } catch (error) {
        console.log(error)
    }
}

export const saveUpdatedCode= async(playgroundId:string,data:TemplateFolder)=>{
    const user= await currentUser();
    if(!user)return null;
    
    try{
        const updatedPlayground= await db.templateFile.upsert({
            where:{playgroundId},
            update:{content:JSON.stringify(data)}, //if we already have
            create:{playgroundId,content:JSON.stringify(data)}// if we dont we create
        })
        return updatedPlayground;
    } catch (error) {
        console.log("updatedSavedCode error:", error);
        return null;
    }
}