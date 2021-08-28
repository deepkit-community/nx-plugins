export interface DbPostgresGeneratorSchema {
  app: string;
  includeDockerCompose?: boolean;
  configPrefix?: string;
  hostPort?: number;
  name?: string;
  user?: string;
  password?: string;
}
