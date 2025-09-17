import * as SQLite from "expo-sqlite";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Feeding } from "./entities/Feeding";

let dataSource: DataSource | null = null;

export async function getDataSource() {
    if (dataSource && dataSource.isInitialized) {
        return dataSource;
    }

    dataSource = new DataSource({
        type: "react-native",
        database: "history.db",
        driver: SQLite,
        location: "default",
        entities: [Feeding],
        synchronize: true
    })

    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    return dataSource;
}

