export const buildModelPayload = (values, allowedFields, numberFields = []) => {
  const numberFieldSet = new Set(numberFields);

  return allowedFields.reduce((payload, field) => {
    const value = values[field];

    if (value === undefined || value === null || value === '') {
      return payload;
    }

    payload[field] = numberFieldSet.has(field) ? Number(value) : value;
    return payload;
  }, {});
};
