import { AdministratorOperationsData, AdministratorQueriesData, CityOperationsData, CityQueriesData, PersonOperationsData, PersonQueriesData, StickerEventOperationsData, StickerEventQueriesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAdministratorOperations(options?: useDataConnectMutationOptions<AdministratorOperationsData, FirebaseError, void>): UseDataConnectMutationResult<AdministratorOperationsData, undefined>;
export function useAdministratorOperations(dc: DataConnect, options?: useDataConnectMutationOptions<AdministratorOperationsData, FirebaseError, void>): UseDataConnectMutationResult<AdministratorOperationsData, undefined>;

export function useAdministratorQueries(options?: useDataConnectQueryOptions<AdministratorQueriesData>): UseDataConnectQueryResult<AdministratorQueriesData, undefined>;
export function useAdministratorQueries(dc: DataConnect, options?: useDataConnectQueryOptions<AdministratorQueriesData>): UseDataConnectQueryResult<AdministratorQueriesData, undefined>;

export function useCityOperations(options?: useDataConnectMutationOptions<CityOperationsData, FirebaseError, void>): UseDataConnectMutationResult<CityOperationsData, undefined>;
export function useCityOperations(dc: DataConnect, options?: useDataConnectMutationOptions<CityOperationsData, FirebaseError, void>): UseDataConnectMutationResult<CityOperationsData, undefined>;

export function useCityQueries(options?: useDataConnectQueryOptions<CityQueriesData>): UseDataConnectQueryResult<CityQueriesData, undefined>;
export function useCityQueries(dc: DataConnect, options?: useDataConnectQueryOptions<CityQueriesData>): UseDataConnectQueryResult<CityQueriesData, undefined>;

export function usePersonOperations(options?: useDataConnectMutationOptions<PersonOperationsData, FirebaseError, void>): UseDataConnectMutationResult<PersonOperationsData, undefined>;
export function usePersonOperations(dc: DataConnect, options?: useDataConnectMutationOptions<PersonOperationsData, FirebaseError, void>): UseDataConnectMutationResult<PersonOperationsData, undefined>;

export function usePersonQueries(options?: useDataConnectQueryOptions<PersonQueriesData>): UseDataConnectQueryResult<PersonQueriesData, undefined>;
export function usePersonQueries(dc: DataConnect, options?: useDataConnectQueryOptions<PersonQueriesData>): UseDataConnectQueryResult<PersonQueriesData, undefined>;

export function useStickerEventOperations(options?: useDataConnectMutationOptions<StickerEventOperationsData, FirebaseError, void>): UseDataConnectMutationResult<StickerEventOperationsData, undefined>;
export function useStickerEventOperations(dc: DataConnect, options?: useDataConnectMutationOptions<StickerEventOperationsData, FirebaseError, void>): UseDataConnectMutationResult<StickerEventOperationsData, undefined>;

export function useStickerEventQueries(options?: useDataConnectQueryOptions<StickerEventQueriesData>): UseDataConnectQueryResult<StickerEventQueriesData, undefined>;
export function useStickerEventQueries(dc: DataConnect, options?: useDataConnectQueryOptions<StickerEventQueriesData>): UseDataConnectQueryResult<StickerEventQueriesData, undefined>;
