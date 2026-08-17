import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AdministratorOperationsData {
  administrator_insert: Administrator_Key;
  administrator_update?: Administrator_Key | null;
  administrator_delete?: Administrator_Key | null;
}

export interface AdministratorQueriesData {
  administrator?: {
    username: string;
    role: string;
  };
  administrators: ({
    username: string;
  })[];
}

export interface Administrator_Key {
  id: UUIDString;
  __typename?: 'Administrator_Key';
}

export interface CityOperationsData {
  city_insert: City_Key;
  city_update?: City_Key | null;
  city_delete?: City_Key | null;
}

export interface CityQueriesData {
  city?: {
    name: string;
    region: string;
  };
  cities: ({
    name: string;
  })[];
}

export interface City_Key {
  id: UUIDString;
  __typename?: 'City_Key';
}

export interface PersonOperationsData {
  person_insert: Person_Key;
  person_update?: Person_Key | null;
  person_delete?: Person_Key | null;
}

export interface PersonQueriesData {
  person?: {
    fullName: string;
    stickerCount: number;
  };
  people: ({
    fullName: string;
  })[];
}

export interface Person_Key {
  id: UUIDString;
  __typename?: 'Person_Key';
}

export interface StickerEventOperationsData {
  stickerEvent_insert: StickerEvent_Key;
  stickerEvent_update?: StickerEvent_Key | null;
  stickerEvent_delete?: StickerEvent_Key | null;
}

export interface StickerEventQueriesData {
  stickerEvent?: {
    amount: number;
    reason: string;
  };
  stickerEvents: ({
    amount: number;
    timestamp: TimestampString;
  })[];
}

export interface StickerEvent_Key {
  id: UUIDString;
  __typename?: 'StickerEvent_Key';
}

interface AdministratorOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<AdministratorOperationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<AdministratorOperationsData, undefined>;
  operationName: string;
}
export const administratorOperationsRef: AdministratorOperationsRef;

export function administratorOperations(): MutationPromise<AdministratorOperationsData, undefined>;
export function administratorOperations(dc: DataConnect): MutationPromise<AdministratorOperationsData, undefined>;

interface AdministratorQueriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdministratorQueriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AdministratorQueriesData, undefined>;
  operationName: string;
}
export const administratorQueriesRef: AdministratorQueriesRef;

export function administratorQueries(options?: ExecuteQueryOptions): QueryPromise<AdministratorQueriesData, undefined>;
export function administratorQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdministratorQueriesData, undefined>;

interface CityOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CityOperationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CityOperationsData, undefined>;
  operationName: string;
}
export const cityOperationsRef: CityOperationsRef;

export function cityOperations(): MutationPromise<CityOperationsData, undefined>;
export function cityOperations(dc: DataConnect): MutationPromise<CityOperationsData, undefined>;

interface CityQueriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CityQueriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<CityQueriesData, undefined>;
  operationName: string;
}
export const cityQueriesRef: CityQueriesRef;

export function cityQueries(options?: ExecuteQueryOptions): QueryPromise<CityQueriesData, undefined>;
export function cityQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<CityQueriesData, undefined>;

interface PersonOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<PersonOperationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<PersonOperationsData, undefined>;
  operationName: string;
}
export const personOperationsRef: PersonOperationsRef;

export function personOperations(): MutationPromise<PersonOperationsData, undefined>;
export function personOperations(dc: DataConnect): MutationPromise<PersonOperationsData, undefined>;

interface PersonQueriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<PersonQueriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<PersonQueriesData, undefined>;
  operationName: string;
}
export const personQueriesRef: PersonQueriesRef;

export function personQueries(options?: ExecuteQueryOptions): QueryPromise<PersonQueriesData, undefined>;
export function personQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<PersonQueriesData, undefined>;

interface StickerEventOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<StickerEventOperationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<StickerEventOperationsData, undefined>;
  operationName: string;
}
export const stickerEventOperationsRef: StickerEventOperationsRef;

export function stickerEventOperations(): MutationPromise<StickerEventOperationsData, undefined>;
export function stickerEventOperations(dc: DataConnect): MutationPromise<StickerEventOperationsData, undefined>;

interface StickerEventQueriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<StickerEventQueriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<StickerEventQueriesData, undefined>;
  operationName: string;
}
export const stickerEventQueriesRef: StickerEventQueriesRef;

export function stickerEventQueries(options?: ExecuteQueryOptions): QueryPromise<StickerEventQueriesData, undefined>;
export function stickerEventQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<StickerEventQueriesData, undefined>;

