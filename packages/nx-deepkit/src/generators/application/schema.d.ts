// export type DbKind = 'postgres' | 'mysql' | 'sqlite' | 'mongo';
export type DbKind = 'postgres' | 'mysql';

export interface ApplicationGeneratorOptions {
  name: string;
  directory?: string;
  dbKind: DbKind;
  dbHostPort: number;
  dbName: string;
  dbUser: string;
  dbPassword?: string;
  tags?: string;
}

export interface NormalizedApplicationGeneratorOptions
  extends ApplicationGeneratorOptions {
  appProjectRoot: Path;
}
