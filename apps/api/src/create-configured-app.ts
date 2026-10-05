import { createApp } from './create-app';
import { config } from './config';
import { MockDataSource } from './data-sources/mock-data-source';
import { WooDataSource } from './data-sources/woo/woo-data-source';

export function createConfiguredApp() {
  const dataSource =
    config.dataSource === 'woo' ? new WooDataSource(config.woo) : new MockDataSource();

  return createApp({
    dataSource,
    dataSourceName: config.dataSource,
    jwtSecret: config.jwtSecret,
    corsOrigins: config.corsOrigins,
  });
}
