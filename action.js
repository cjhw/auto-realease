const path = require('path')
const fs = require('fs')
const client = require('scp2')
const ora = require('ora')
const readline = require('readline-sync')
const { Client } = require('ssh2')
const chalk = require('chalk')
let configPath = path.resolve('./auto.config.js')

let createConfigAction = async () => {
  let content = fs.readFileSync(path.resolve(__dirname, './config.js'))
  console.log(configPath)
  console.log(path.resolve(__dirname, './auto.config.js'))
  fs.writeFileSync(configPath, content)
}

let AutoReleaseAction = async () => {
  let config

  try {
    let stats = fs.statSync(configPath)
  } catch (error) {
    throw new Error(
      '必须加一个配置文件auto.config.js，请使用命令auto file生成配置文件并编辑'
    )
  }

  config = require(configPath)

  let server = {
    host: '', // ip
    port: 22, // 端口一般默认22
    username: '', // 用户名
    password: '', // 密码
    pathName: '/test/dist', // 上传到服务器的位置
    locaPath: './dist/', // 本地打包文件的位置
  }

  server = { ...server, ...config }
  // console.log(server)

  const spinner = ora('正在发布到服务器...')
  const conn = new Client()

  server.username = readline.question(chalk.yellow('username:'))
  server.password = readline.question(chalk.blue('password:'), {
    hideEchoBack: true,
  })
  console.log(chalk.blue('正在建立连接'))
  conn
    .on('ready', function () {
      console.log(chalk.green('已连接'))
      if (!server.pathName || server.pathName === '/') {
        console.log(chalk.green('连接已关闭'))
        conn.end()
        return false
      }
      console.log('rm -rf ' + server.pathName + '/*')
      conn.exec('rm -rf ' + server.pathName + '/*', (err, stream) => {
        if (err) throw err
        stream
          .on('close', (code, signal) => {
            console.log(chalk.cyan('开始上传'))
            spinner.start()
            client.scp(
              server.locaPath,
              {
                host: server.host,
                port: server.port,
                username: server.username,
                password: server.password,
                path: server.pathName,
              },
              (err) => {
                spinner.stop()
                if (!err) {
                  console.log(chalk.magenta('项目上传成功'))
                } else {
                  console.log(chalk.red('发生了错误，错误信息:', err))
                }
                conn.end() // 结束命令
              }
            )
          })
          .on('data', (data) => {
            console.log('STDOUT: ' + data)
          })
          .stderr.on('data', (data) => {
            console.log('STDERR: ' + data)
          })
      })
    })
    .connect({
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password,
    })
}

module.exports = { createConfigAction, AutoReleaseAction }
