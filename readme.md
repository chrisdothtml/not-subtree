# not-subtree

> git "subtrees" without `git subtree`

## Install

```sh
npm i -g not-subtree

# or just use npx
npx not-subtree [...]
```

## Use

### not-subtree add

```
Description
  Add new subtree from an external repo

Usage
  $ not-subtree add [options]

Options
  -p, --path       [required] Sub-path to add new subtree to
  -r, --remote     [required] External repo git remote url
  -b, --branch     External repo branch to use
  -m, --message    Commit message
  -h, --help       Displays this message

Examples
  $ not-subtree add -p bar -r git@github.com:foo/bar.git
```

### not-subtree pull

```
Description
  Pull external repo's changed files between --base-branch and --head-branch

Usage
  $ not-subtree pull [options]

Options
  -p, --path       [required] Sub-path to pull subtree into
  -r, --remote     [required] External repo git remote url
  --head-branch    [required]
  --base-branch    (default: master)
  -m, --message    Commit message
  -h, --help       Displays this message

Examples
  $ not-subtree pull -p bar -r git@github.com:foo/bar.git --head-branch feature/foo
  $ not-subtree pull -p bar -r git@github.com:foo/bar.git --base-branch develop --head-branch feature/foo
```

### not-subtree push

```
Description
  Push changed files between --base-branch and current branch into --remote-branch of external repo

Usage
  $ not-subtree push [options]

Options
  -p, --path         [required] Sub-path to pull subtree into
  -r, --remote       [required] External repo git remote url
  --base-branch      (default: master)
  --remote-branch    (default: current branch name)
  -m, --message      Commit message
  -h, --help         Displays this message

Examples
  $ not-subtree push -p bar -r git@github.com:foo/bar.git
  $ not-subtree push -p bar -r git@github.com:foo/bar.git --remote-branch develop
```
