import fs from 'fs';
import { YAML } from 'bun';

type Config = {
  MONOKIT_URL: string;
  AWX_SETUP_TEMPLATE_ID: number;
  AWX_PING_TEMPLATE_ID: number;
  ORIGINS: string[];
  PORT: number;
  LOCAL_AUTH?: boolean;
};

let config: Config;

if (!Bun.env.BUILD_STEP) {
  if (!fs.existsSync('/etc/mono/panel.yaml')) {
    console.error('Configuration file /etc/mono/panel.yaml does not exist.');
    process.exit(1);
  }

  try {
    const configYaml = <Record<string, string>>(
      YAML.parse(fs.readFileSync('/etc/mono/panel.yaml', 'utf8'))
    );
    config = {
      PORT: Number(configYaml.PORT),
      MONOKIT_URL: configYaml.MONOKIT_URL,
      AWX_SETUP_TEMPLATE_ID: Number(configYaml.AWX_SETUP_TEMPLATE_ID),
      AWX_PING_TEMPLATE_ID: Number(configYaml.AWX_PING_TEMPLATE_ID),
      ORIGINS: JSON.parse(configYaml.ORIGINS)
    };
  } catch (e) {
    console.error('Failed to read or parse configuration file:', e);
    process.exit(1);
  }
} else {
  config = {} as Config;
}

export default config;
