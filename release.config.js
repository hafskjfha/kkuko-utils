module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/<username>/<repo>", // 깃허브 URL
  plugins: [
    "@semantic-release/commit-analyzer", // 커밋 분석해서 버전 결정
    "@semantic-release/release-notes-generator", // 릴리즈 노트 생성
    "@semantic-release/changelog", // CHANGELOG.md 업데이트
    ["@semantic-release/git", {
      assets: ["CHANGELOG.md", "package.json"], // 버전 업데이트 후 커밋
      message: "chore(release): ${nextRelease.version} [skip ci]"
    }],
    "@semantic-release/github" // 깃허브 릴리즈 발행
  ]
};
