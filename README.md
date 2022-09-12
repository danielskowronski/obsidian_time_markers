# obsidian-time-markers

Plugin for Obsidian (https://obsidian.md) that shows time markers from current note in sidebar

## Usage

1. Click `Time Markers` on left ribbon.
2. `Time Markers` tab will appear on right sidebar.
3. It'll list all lines in current file that contain time marker as links to those lines, sorted by time marker.
  1. ***Time marker*** is 24hrs time in HH:MM or H:MM format (where minutes can be also `XX`) that is surrounded by one of following:
	  1. whitespace
	  2. line start/end 
	  3. backticks (`` ` ``); those will also be stripped later on the list
	  4. dahses (`-`) - as in `10:00-10:30`
  1. Time markers that are on completed tasks lines will be omitted. ***Completed tasks*** are represented in Markdown as:
	  - `- [x] completed task` 
	  - `- [X] completed task` 
	  - `- [-] cancelled task` 
  1. Time markers that are on incompleted tasks will have Markdown task syntax stripped (i.e. `- [ ] some task` will become `some task`)

## Development

- clone this repo to test Obsidian vault under (`.obsidian/plugins/obsidian-time-markers`)
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode; to refresh plugin in Obsidian issue `Reload app without saving` from command palette (preferably bind it to some Hotkey) 
- `eslint main.ts view.ts`  to use eslint to analyze this project
- bump `package.json` and `manifest.json`
- `npm run build` to build
- `npm publish` to publish
