module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'auto' }],
    '@babel/preset-typescript',
    '@babel/preset-react', // 만약 누락됐다면 꼭 필요
  ],
}
