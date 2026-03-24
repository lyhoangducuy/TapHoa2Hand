import { API } from "../configurations/configuration"

export const login=async(username,password)=>{
    return await fetch(API.LOGIN,{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({username,password})
    })
}