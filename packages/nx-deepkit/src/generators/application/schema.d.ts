export interface ApplicationGeneratorOptions {
  name: string;
  db: boolean;
  tags?: string;
  directory?: string;
  dbConfig?: {
    kind: 'postgres';
    hostPort?: number;
    name: string;
    password: string;
  };
}

export interface NormalizedApplicationGeneratorOptions
  extends ApplicationGeneratorOptions {
  appProjectRoot: Path;
}

export type NormalizedDbOptions = Required<
  NonNullable<ApplicationGeneratorOptions['dbConfig']>
>;
