# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*AdministratorQueries*](#administratorqueries)
  - [*CityQueries*](#cityqueries)
  - [*PersonQueries*](#personqueries)
  - [*StickerEventQueries*](#stickereventqueries)
- [**Mutations**](#mutations)
  - [*AdministratorOperations*](#administratoroperations)
  - [*CityOperations*](#cityoperations)
  - [*PersonOperations*](#personoperations)
  - [*StickerEventOperations*](#stickereventoperations)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## AdministratorQueries
You can execute the `AdministratorQueries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
administratorQueries(options?: ExecuteQueryOptions): QueryPromise<AdministratorQueriesData, undefined>;

interface AdministratorQueriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AdministratorQueriesData, undefined>;
}
export const administratorQueriesRef: AdministratorQueriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
administratorQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AdministratorQueriesData, undefined>;

interface AdministratorQueriesRef {
  ...
  (dc: DataConnect): QueryRef<AdministratorQueriesData, undefined>;
}
export const administratorQueriesRef: AdministratorQueriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the administratorQueriesRef:
```typescript
const name = administratorQueriesRef.operationName;
console.log(name);
```

### Variables
The `AdministratorQueries` query has no variables.
### Return Type
Recall that executing the `AdministratorQueries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdministratorQueriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AdministratorQueriesData {
  administrator?: {
    username: string;
    role: string;
  };
  administrators: ({
    username: string;
  })[];
}
```
### Using `AdministratorQueries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, administratorQueries } from '@dataconnect/generated';


// Call the `administratorQueries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await administratorQueries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await administratorQueries(dataConnect);

console.log(data.administrator);
console.log(data.administrators);

// Or, you can use the `Promise` API.
administratorQueries().then((response) => {
  const data = response.data;
  console.log(data.administrator);
  console.log(data.administrators);
});
```

### Using `AdministratorQueries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, administratorQueriesRef } from '@dataconnect/generated';


// Call the `administratorQueriesRef()` function to get a reference to the query.
const ref = administratorQueriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = administratorQueriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.administrator);
console.log(data.administrators);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.administrator);
  console.log(data.administrators);
});
```

## CityQueries
You can execute the `CityQueries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cityQueries(options?: ExecuteQueryOptions): QueryPromise<CityQueriesData, undefined>;

interface CityQueriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CityQueriesData, undefined>;
}
export const cityQueriesRef: CityQueriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
cityQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<CityQueriesData, undefined>;

interface CityQueriesRef {
  ...
  (dc: DataConnect): QueryRef<CityQueriesData, undefined>;
}
export const cityQueriesRef: CityQueriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cityQueriesRef:
```typescript
const name = cityQueriesRef.operationName;
console.log(name);
```

### Variables
The `CityQueries` query has no variables.
### Return Type
Recall that executing the `CityQueries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CityQueriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CityQueriesData {
  city?: {
    name: string;
    region: string;
  };
  cities: ({
    name: string;
  })[];
}
```
### Using `CityQueries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cityQueries } from '@dataconnect/generated';


// Call the `cityQueries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cityQueries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cityQueries(dataConnect);

console.log(data.city);
console.log(data.cities);

// Or, you can use the `Promise` API.
cityQueries().then((response) => {
  const data = response.data;
  console.log(data.city);
  console.log(data.cities);
});
```

### Using `CityQueries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, cityQueriesRef } from '@dataconnect/generated';


// Call the `cityQueriesRef()` function to get a reference to the query.
const ref = cityQueriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cityQueriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.city);
console.log(data.cities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.city);
  console.log(data.cities);
});
```

## PersonQueries
You can execute the `PersonQueries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
personQueries(options?: ExecuteQueryOptions): QueryPromise<PersonQueriesData, undefined>;

interface PersonQueriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<PersonQueriesData, undefined>;
}
export const personQueriesRef: PersonQueriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
personQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<PersonQueriesData, undefined>;

interface PersonQueriesRef {
  ...
  (dc: DataConnect): QueryRef<PersonQueriesData, undefined>;
}
export const personQueriesRef: PersonQueriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the personQueriesRef:
```typescript
const name = personQueriesRef.operationName;
console.log(name);
```

### Variables
The `PersonQueries` query has no variables.
### Return Type
Recall that executing the `PersonQueries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PersonQueriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PersonQueriesData {
  person?: {
    fullName: string;
    stickerCount: number;
  };
  people: ({
    fullName: string;
  })[];
}
```
### Using `PersonQueries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, personQueries } from '@dataconnect/generated';


// Call the `personQueries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await personQueries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await personQueries(dataConnect);

console.log(data.person);
console.log(data.people);

// Or, you can use the `Promise` API.
personQueries().then((response) => {
  const data = response.data;
  console.log(data.person);
  console.log(data.people);
});
```

### Using `PersonQueries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, personQueriesRef } from '@dataconnect/generated';


// Call the `personQueriesRef()` function to get a reference to the query.
const ref = personQueriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = personQueriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.person);
console.log(data.people);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.person);
  console.log(data.people);
});
```

## StickerEventQueries
You can execute the `StickerEventQueries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
stickerEventQueries(options?: ExecuteQueryOptions): QueryPromise<StickerEventQueriesData, undefined>;

interface StickerEventQueriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<StickerEventQueriesData, undefined>;
}
export const stickerEventQueriesRef: StickerEventQueriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
stickerEventQueries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<StickerEventQueriesData, undefined>;

interface StickerEventQueriesRef {
  ...
  (dc: DataConnect): QueryRef<StickerEventQueriesData, undefined>;
}
export const stickerEventQueriesRef: StickerEventQueriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the stickerEventQueriesRef:
```typescript
const name = stickerEventQueriesRef.operationName;
console.log(name);
```

### Variables
The `StickerEventQueries` query has no variables.
### Return Type
Recall that executing the `StickerEventQueries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `StickerEventQueriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `StickerEventQueries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, stickerEventQueries } from '@dataconnect/generated';


// Call the `stickerEventQueries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await stickerEventQueries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await stickerEventQueries(dataConnect);

console.log(data.stickerEvent);
console.log(data.stickerEvents);

// Or, you can use the `Promise` API.
stickerEventQueries().then((response) => {
  const data = response.data;
  console.log(data.stickerEvent);
  console.log(data.stickerEvents);
});
```

### Using `StickerEventQueries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, stickerEventQueriesRef } from '@dataconnect/generated';


// Call the `stickerEventQueriesRef()` function to get a reference to the query.
const ref = stickerEventQueriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = stickerEventQueriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stickerEvent);
console.log(data.stickerEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stickerEvent);
  console.log(data.stickerEvents);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AdministratorOperations
You can execute the `AdministratorOperations` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
administratorOperations(): MutationPromise<AdministratorOperationsData, undefined>;

interface AdministratorOperationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<AdministratorOperationsData, undefined>;
}
export const administratorOperationsRef: AdministratorOperationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
administratorOperations(dc: DataConnect): MutationPromise<AdministratorOperationsData, undefined>;

interface AdministratorOperationsRef {
  ...
  (dc: DataConnect): MutationRef<AdministratorOperationsData, undefined>;
}
export const administratorOperationsRef: AdministratorOperationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the administratorOperationsRef:
```typescript
const name = administratorOperationsRef.operationName;
console.log(name);
```

### Variables
The `AdministratorOperations` mutation has no variables.
### Return Type
Recall that executing the `AdministratorOperations` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdministratorOperationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AdministratorOperationsData {
  administrator_insert: Administrator_Key;
  administrator_update?: Administrator_Key | null;
  administrator_delete?: Administrator_Key | null;
}
```
### Using `AdministratorOperations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, administratorOperations } from '@dataconnect/generated';


// Call the `administratorOperations()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await administratorOperations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await administratorOperations(dataConnect);

console.log(data.administrator_insert);
console.log(data.administrator_update);
console.log(data.administrator_delete);

// Or, you can use the `Promise` API.
administratorOperations().then((response) => {
  const data = response.data;
  console.log(data.administrator_insert);
  console.log(data.administrator_update);
  console.log(data.administrator_delete);
});
```

### Using `AdministratorOperations`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, administratorOperationsRef } from '@dataconnect/generated';


// Call the `administratorOperationsRef()` function to get a reference to the mutation.
const ref = administratorOperationsRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = administratorOperationsRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.administrator_insert);
console.log(data.administrator_update);
console.log(data.administrator_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.administrator_insert);
  console.log(data.administrator_update);
  console.log(data.administrator_delete);
});
```

## CityOperations
You can execute the `CityOperations` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cityOperations(): MutationPromise<CityOperationsData, undefined>;

interface CityOperationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CityOperationsData, undefined>;
}
export const cityOperationsRef: CityOperationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
cityOperations(dc: DataConnect): MutationPromise<CityOperationsData, undefined>;

interface CityOperationsRef {
  ...
  (dc: DataConnect): MutationRef<CityOperationsData, undefined>;
}
export const cityOperationsRef: CityOperationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cityOperationsRef:
```typescript
const name = cityOperationsRef.operationName;
console.log(name);
```

### Variables
The `CityOperations` mutation has no variables.
### Return Type
Recall that executing the `CityOperations` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CityOperationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CityOperationsData {
  city_insert: City_Key;
  city_update?: City_Key | null;
  city_delete?: City_Key | null;
}
```
### Using `CityOperations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cityOperations } from '@dataconnect/generated';


// Call the `cityOperations()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cityOperations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cityOperations(dataConnect);

console.log(data.city_insert);
console.log(data.city_update);
console.log(data.city_delete);

// Or, you can use the `Promise` API.
cityOperations().then((response) => {
  const data = response.data;
  console.log(data.city_insert);
  console.log(data.city_update);
  console.log(data.city_delete);
});
```

### Using `CityOperations`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, cityOperationsRef } from '@dataconnect/generated';


// Call the `cityOperationsRef()` function to get a reference to the mutation.
const ref = cityOperationsRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cityOperationsRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.city_insert);
console.log(data.city_update);
console.log(data.city_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.city_insert);
  console.log(data.city_update);
  console.log(data.city_delete);
});
```

## PersonOperations
You can execute the `PersonOperations` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
personOperations(): MutationPromise<PersonOperationsData, undefined>;

interface PersonOperationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<PersonOperationsData, undefined>;
}
export const personOperationsRef: PersonOperationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
personOperations(dc: DataConnect): MutationPromise<PersonOperationsData, undefined>;

interface PersonOperationsRef {
  ...
  (dc: DataConnect): MutationRef<PersonOperationsData, undefined>;
}
export const personOperationsRef: PersonOperationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the personOperationsRef:
```typescript
const name = personOperationsRef.operationName;
console.log(name);
```

### Variables
The `PersonOperations` mutation has no variables.
### Return Type
Recall that executing the `PersonOperations` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PersonOperationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PersonOperationsData {
  person_insert: Person_Key;
  person_update?: Person_Key | null;
  person_delete?: Person_Key | null;
}
```
### Using `PersonOperations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, personOperations } from '@dataconnect/generated';


// Call the `personOperations()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await personOperations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await personOperations(dataConnect);

console.log(data.person_insert);
console.log(data.person_update);
console.log(data.person_delete);

// Or, you can use the `Promise` API.
personOperations().then((response) => {
  const data = response.data;
  console.log(data.person_insert);
  console.log(data.person_update);
  console.log(data.person_delete);
});
```

### Using `PersonOperations`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, personOperationsRef } from '@dataconnect/generated';


// Call the `personOperationsRef()` function to get a reference to the mutation.
const ref = personOperationsRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = personOperationsRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.person_insert);
console.log(data.person_update);
console.log(data.person_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.person_insert);
  console.log(data.person_update);
  console.log(data.person_delete);
});
```

## StickerEventOperations
You can execute the `StickerEventOperations` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
stickerEventOperations(): MutationPromise<StickerEventOperationsData, undefined>;

interface StickerEventOperationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<StickerEventOperationsData, undefined>;
}
export const stickerEventOperationsRef: StickerEventOperationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
stickerEventOperations(dc: DataConnect): MutationPromise<StickerEventOperationsData, undefined>;

interface StickerEventOperationsRef {
  ...
  (dc: DataConnect): MutationRef<StickerEventOperationsData, undefined>;
}
export const stickerEventOperationsRef: StickerEventOperationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the stickerEventOperationsRef:
```typescript
const name = stickerEventOperationsRef.operationName;
console.log(name);
```

### Variables
The `StickerEventOperations` mutation has no variables.
### Return Type
Recall that executing the `StickerEventOperations` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `StickerEventOperationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface StickerEventOperationsData {
  stickerEvent_insert: StickerEvent_Key;
  stickerEvent_update?: StickerEvent_Key | null;
  stickerEvent_delete?: StickerEvent_Key | null;
}
```
### Using `StickerEventOperations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, stickerEventOperations } from '@dataconnect/generated';


// Call the `stickerEventOperations()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await stickerEventOperations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await stickerEventOperations(dataConnect);

console.log(data.stickerEvent_insert);
console.log(data.stickerEvent_update);
console.log(data.stickerEvent_delete);

// Or, you can use the `Promise` API.
stickerEventOperations().then((response) => {
  const data = response.data;
  console.log(data.stickerEvent_insert);
  console.log(data.stickerEvent_update);
  console.log(data.stickerEvent_delete);
});
```

### Using `StickerEventOperations`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, stickerEventOperationsRef } from '@dataconnect/generated';


// Call the `stickerEventOperationsRef()` function to get a reference to the mutation.
const ref = stickerEventOperationsRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = stickerEventOperationsRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.stickerEvent_insert);
console.log(data.stickerEvent_update);
console.log(data.stickerEvent_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.stickerEvent_insert);
  console.log(data.stickerEvent_update);
  console.log(data.stickerEvent_delete);
});
```

