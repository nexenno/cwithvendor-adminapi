import { PipelineStage } from "mongoose";
import { IncomingMessage, ServerResponse, IncomingHttpHeaders } from "http";
import { varConfig } from "../assets/var-config";
export type UserTypes = (typeof varConfig.user_types)[number]
export type SendDBQuery<T = ObjectPayload> = T & { error?: ObjectPayload } | ObjectPayload & { error: ObjectPayload } | null
export type PipelineQuery = PipelineStage[]

export interface RequestObject extends IncomingMessage {
   body?: any;
   query?: any;
}

export interface ResponseObject extends ServerResponse {
   status: (value: number) => ResponseObject;
   json: (value: object) => void;
   text: (value: string) => void;
}


export type MakeHTTPReqProp = {
   url: string;
   json?: object;
   form?: ObjectPayload;
   method?: string;
   formData?: object;
   headers?: IncomingHttpHeaders;
}


export type ObjectPayload = {
   [key: string]: any
}


export type JWTTokenPayload = {
   user_id: string;
   email: string;
   user_type: UserTypes;
   name: string;
   role_list: Array<string>
}


export interface PrivateMethodProps {
   body: ObjectPayload;
   res: ResponseObject;
   req: RequestObject;
   query: ObjectPayload;
   userData: JWTTokenPayload;
   id?: string;
   idMethod?: {
      post?: 'required' | 'optional',
      get?: 'required' | 'optional',
      put?: 'required' | 'optional',
      delete?: 'required' | 'optional',
      patch?: 'required' | 'optional',
   }
}

export interface SubRequestHandler {
   post?: (params: PrivateMethodProps) => void;
   put?: (params: PrivateMethodProps) => void;
   get?: (params: PrivateMethodProps) => void;
   delete?: (params: PrivateMethodProps) => void;
   patch?: (params: PrivateMethodProps) => void;
}


export type IsNumberProp = {
   input: string;
   type: "float" | "int" | "float-int";
   length?: number;
   minLength?: number;
   maxLength?: number;
   unit?: "positive" | "negative";
   min?: number;
   max?: number
}


export type SendMailData = {
   from: string,
   to: string | string[],
   subject: string,
   text?: string,
   attachments?: Array<string>,
   html?: string | undefined;
   replyTo?: string;
}