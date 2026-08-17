const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'painel-alagoas',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const administratorOperationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AdministratorOperations');
}
administratorOperationsRef.operationName = 'AdministratorOperations';
exports.administratorOperationsRef = administratorOperationsRef;

exports.administratorOperations = function administratorOperations(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(administratorOperationsRef(dcInstance, inputVars));
}
;

const administratorQueriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdministratorQueries');
}
administratorQueriesRef.operationName = 'AdministratorQueries';
exports.administratorQueriesRef = administratorQueriesRef;

exports.administratorQueries = function administratorQueries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(administratorQueriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const cityOperationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CityOperations');
}
cityOperationsRef.operationName = 'CityOperations';
exports.cityOperationsRef = cityOperationsRef;

exports.cityOperations = function cityOperations(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(cityOperationsRef(dcInstance, inputVars));
}
;

const cityQueriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CityQueries');
}
cityQueriesRef.operationName = 'CityQueries';
exports.cityQueriesRef = cityQueriesRef;

exports.cityQueries = function cityQueries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(cityQueriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const personOperationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PersonOperations');
}
personOperationsRef.operationName = 'PersonOperations';
exports.personOperationsRef = personOperationsRef;

exports.personOperations = function personOperations(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(personOperationsRef(dcInstance, inputVars));
}
;

const personQueriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PersonQueries');
}
personQueriesRef.operationName = 'PersonQueries';
exports.personQueriesRef = personQueriesRef;

exports.personQueries = function personQueries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(personQueriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const stickerEventOperationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'StickerEventOperations');
}
stickerEventOperationsRef.operationName = 'StickerEventOperations';
exports.stickerEventOperationsRef = stickerEventOperationsRef;

exports.stickerEventOperations = function stickerEventOperations(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(stickerEventOperationsRef(dcInstance, inputVars));
}
;

const stickerEventQueriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'StickerEventQueries');
}
stickerEventQueriesRef.operationName = 'StickerEventQueries';
exports.stickerEventQueriesRef = stickerEventQueriesRef;

exports.stickerEventQueries = function stickerEventQueries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(stickerEventQueriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
