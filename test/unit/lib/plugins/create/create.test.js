'use strict';

const chai = require('chai');
const fsp = require('fs').promises;
const path = require('path');
const fse = require('fs-extra');
const { getTmpDirPath } = require('../../../../utils/fs');
const runServerless = require('../../../../utils/run-serverless');

chai.use(require('chai-as-promised'));

const expect = chai.expect;

const fixturesPath = path.resolve(__dirname, '../../../../fixtures/programmatic');

// TODO: MOVE TO INTEGRATION TESTS?
describe('test/unit/lib/plugins/create/create.test.js', () => {
  it('should generate scaffolding for "aws-nodejs" template in provided path and rename service', async () => {
    const tmpDir = getTmpDirPath();
    await runServerless({
      noService: true,
      command: 'create',
      options: {
        template: 'aws-nodejs',
        path: tmpDir,
        name: 'new-service-name',
      },
    });
    const dirContent = await fsp.readdir(tmpDir);
    expect(dirContent).to.include('handler.js');
    expect(dirContent).to.include('serverless.yml');
    expect(dirContent).to.include('.gitignore');

    const serverlessYmlfileContent = (
      await fsp.readFile(path.join(tmpDir, 'serverless.yml'))
    ).toString();
    expect(serverlessYmlfileContent).to.include('service: new-service-name');
  });

  it('should generate scaffolding for "aws-nodejs" template in current directory', async () => {
    const tmpDir = getTmpDirPath();
    await fse.ensureDir(tmpDir);
    await runServerless({
      cwd: tmpDir,
      command: 'create',
      options: {
        template: 'aws-nodejs',
      },
    });
    const dirContent = await fsp.readdir(tmpDir);
    expect(dirContent).to.include('handler.js');
    expect(dirContent).to.include('serverless.yml');
    expect(dirContent).to.include('.gitignore');

    const serverlessYmlfileContent = (
      await fsp.readFile(path.join(tmpDir, 'serverless.yml'))
    ).toString();
    // We are checking that it includes basename of dir as it will be included in service name
    expect(serverlessYmlfileContent).to.include(path.basename(tmpDir));
  });

  it('should generate scaffolding for "plugin" template', async () => {
    const tmpDir = getTmpDirPath();
    await fse.ensureDir(tmpDir);
    await runServerless({
      cwd: tmpDir,
      command: 'create',
      options: {
        template: 'plugin',
      },
    });
    const dirContent = await fsp.readdir(tmpDir);
    expect(dirContent).to.include('index.js');
    expect(dirContent).to.include('README.md');
    expect(dirContent).to.include('package.json');
  });

  it('should error out when trying to create project in current working dir and the project files are already present in it', async () => {
    const tmpDir = getTmpDirPath();
    await fse.ensureDir(tmpDir);
    await fsp.writeFile(path.join(tmpDir, 'handler.js'), '');
    await expect(
      runServerless({
        cwd: tmpDir,
        command: 'create',
        options: {
          template: 'aws-nodejs',
          path: tmpDir,
        },
      })
    ).to.eventually.be.rejected.and.have.property('code', 'TEMPLATE_FILE_ALREADY_EXISTS');
  });

  it('should error out when trying to create project in already existing directory (other than current working dir)', async () => {
    const tmpDir = getTmpDirPath();
    await fse.ensureDir(tmpDir);
    await expect(
      runServerless({
        noService: true,
        command: 'create',
        options: {
          template: 'aws-nodejs',
          path: tmpDir,
        },
      })
    ).to.eventually.be.rejected.and.have.property('code', 'TARGET_FOLDER_ALREADY_EXISTS');
  });

  it('should error out when trying to create project from nonexistent template', async () => {
    await expect(
      runServerless({
        noService: true,
        command: 'create',
        options: {
          template: 'aws-nodejs-nonexistent',
        },
      })
    ).to.eventually.be.rejected.and.have.property('code', 'NOT_SUPPORTED_TEMPLATE');
  });

  it('should generate scaffolding for local template in provided path and rename service', async () => {
    const tmpDir = getTmpDirPath();
    await runServerless({
      noService: true,
      command: 'create',
      options: {
        'template-path': path.join(fixturesPath, 'aws'),
        'path': tmpDir,
        'name': 'new-service-name',
      },
    });
    const dirContent = await fsp.readdir(tmpDir);
    expect(dirContent).to.include('serverless.yml');

    const serverlessYmlfileContent = (
      await fsp.readFile(path.join(tmpDir, 'serverless.yml'))
    ).toString();
    expect(serverlessYmlfileContent).to.include('service: new-service-name');
  });
});
