import { config } from './config';
import { createConfiguredApp } from './create-configured-app';

const app = createConfiguredApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API lista en http://localhost:${config.port}/api (modo ${config.dataSource})`);
  if (config.dataSource === 'woo') console.log(`Conectada a ${config.woo.url}`);
});
