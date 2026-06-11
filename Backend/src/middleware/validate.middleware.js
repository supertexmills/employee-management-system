export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const parsed = schema.parse(req[source]);
    if (source === "body") {
      req.body = parsed;
    } else if (source === "query") {
      req.validatedQuery = parsed;
    } else if (source === "params") {
      req.validatedParams = parsed;
    }
    next();
  };
}
