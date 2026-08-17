# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useAdministratorOperations, useAdministratorQueries, useCityOperations, useCityQueries, usePersonOperations, usePersonQueries, useStickerEventOperations, useStickerEventQueries } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useAdministratorOperations();

const { data, isPending, isSuccess, isError, error } = useAdministratorQueries();

const { data, isPending, isSuccess, isError, error } = useCityOperations();

const { data, isPending, isSuccess, isError, error } = useCityQueries();

const { data, isPending, isSuccess, isError, error } = usePersonOperations();

const { data, isPending, isSuccess, isError, error } = usePersonQueries();

const { data, isPending, isSuccess, isError, error } = useStickerEventOperations();

const { data, isPending, isSuccess, isError, error } = useStickerEventQueries();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { administratorOperations, administratorQueries, cityOperations, cityQueries, personOperations, personQueries, stickerEventOperations, stickerEventQueries } from '@dataconnect/generated';


// Operation AdministratorOperations: 
const { data } = await AdministratorOperations(dataConnect);

// Operation AdministratorQueries: 
const { data } = await AdministratorQueries(dataConnect);

// Operation CityOperations: 
const { data } = await CityOperations(dataConnect);

// Operation CityQueries: 
const { data } = await CityQueries(dataConnect);

// Operation PersonOperations: 
const { data } = await PersonOperations(dataConnect);

// Operation PersonQueries: 
const { data } = await PersonQueries(dataConnect);

// Operation StickerEventOperations: 
const { data } = await StickerEventOperations(dataConnect);

// Operation StickerEventQueries: 
const { data } = await StickerEventQueries(dataConnect);


```