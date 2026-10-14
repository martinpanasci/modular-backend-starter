export abstract class DatabaseHealthPort {
  abstract check(): Promise<void>;
}
