/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

import * as Context from "./graphql/context"
import * as Prisma from ".prisma/client"
import { FieldAuthorizeResolver } from "@nexus/schema/dist/plugins/fieldAuthorizePlugin"


declare global {
  interface NexusGenCustomOutputProperties<TypeName extends string> {
    model: NexusPrisma<TypeName, 'model'>
    crud: any
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  UpdateUserProfileInput: { // input type
    bio?: string | null; // String
    country?: string | null; // String
    customUrlPath?: string | null; // String
    sensMotion?: number | null; // Float
    sensStick?: number | null; // Float
    twitchName?: string | null; // String
    twitterName?: string | null; // String
    weaponPool?: string[] | null; // [String!]
    youtubeId?: string | null; // String
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenRootTypes {
  Mutation: {};
  Profile: Prisma.Profile;
  Query: {};
  User: Prisma.User;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  UpdateUserProfileInput: NexusGenInputs['UpdateUserProfileInput'];
  String: NexusGenScalars['String'];
  Int: NexusGenScalars['Int'];
  Float: NexusGenScalars['Float'];
  Boolean: NexusGenScalars['Boolean'];
  ID: NexusGenScalars['ID'];
}

export interface NexusGenFieldTypes {
  Mutation: { // field return type
    updateUserProfile: boolean; // Boolean!
  }
  Profile: { // field return type
    bio: string | null; // String
    country: string | null; // String
    customUrlPath: string | null; // String
    sensMotion: number | null; // Float
    sensStick: number | null; // Float
    twitchName: string | null; // String
    twitterName: string | null; // String
    weaponPool: string[]; // [String!]!
    youtubeId: string | null; // String
  }
  Query: { // field return type
    getUserByIdentifier: NexusGenRootTypes['User'] | null; // User
  }
  User: { // field return type
    avatarUrl: string | null; // String
    discordId: string; // String!
    fullUsername: string; // String!
    id: number; // Int!
    profile: NexusGenRootTypes['Profile'] | null; // Profile
    profilePath: string; // String!
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    updateUserProfile: { // args
      profile: NexusGenInputs['UpdateUserProfileInput']; // UpdateUserProfileInput!
    }
  }
  Query: {
    getUserByIdentifier: { // args
      identifier: string; // String!
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "Mutation" | "Profile" | "Query" | "User";

export type NexusGenInputNames = "UpdateUserProfileInput";

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = "Boolean" | "Float" | "ID" | "Int" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: Context.Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  allTypes: NexusGenAllTypes;
  inheritedFields: NexusGenInheritedFields;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
    /**
     * Authorization for an individual field. Returning "true"
     * or "Promise<true>" means the field can be accessed.
     * Returning "false" or "Promise<false>" will respond
     * with a "Not Authorized" error for the field.
     * Returning or throwing an error will also prevent the
     * resolver from executing.
     */
    authorize?: FieldAuthorizeResolver<TypeName, FieldName>
  }
  interface NexusGenPluginSchemaConfig {
  }
}