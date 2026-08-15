const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

const handleServiceError = (error, serviceName, methodName) => {
  const fallbackMessage = `Error in client > services > ${serviceName} > ${methodName}`;
  const message = getErrorMessage(error, fallbackMessage);

  console.error(fallbackMessage + ":", error);

  return new Error(message);
};

export default handleServiceError;
export { getErrorMessage };
