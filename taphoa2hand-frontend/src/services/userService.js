import { API } from "../configurations/configuration"
import httpClient from "../configurations/httpClient"
import { getToken } from "./localstorageService"
export const getMyInfo=async()=>{
    return await httpClient.get(API.MY_INFO,{
        headers:{
            Authorization: `Bearer ${getToken()}`
        }
    })
}
