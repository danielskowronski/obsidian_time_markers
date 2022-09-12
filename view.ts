import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_TIMEMARKERS = "time-markers-view-type";

export class TimeMarkersView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_TIMEMARKERS;
	}

	getDisplayText() {
		return "Time Markers";
	}

	initView(){
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Time Markers" }); 
	}

	jumpToLine(leafID: string, line: number, ch: number){
		// @ts-ignore
		const editorObj=this.app.workspace.getLeafById(leafID).view.sourceMode.cmEditor;
		editorObj.focus();
		editorObj.setCursor({line: line, ch: ch});
	}

	async parseNote(){
		await this.delay(100);
		this.initView();

		try {
			const container = this.containerEl.children[1];
			// @ts-ignore
			const leafID = this.app.workspace.activeLeaf.id;
			// @ts-ignore
			const editorObj=this.app.workspace.activeLeaf.view.sourceMode.cmEditor;

			const timeMarkers = [];
			for (let lineNum=0; lineNum<editorObj.lineCount(); lineNum++){
				const lineText = editorObj.getLine(lineNum);
				
				const lineTimeMarkerMatch = lineText.match(/^[0-2]?[0-9]:([0-5][0-9]|XX)[\s-]+.*|.*[\s`-]+[0-2]?[0-9]:([0-5][0-9]|XX)[\s-`]+.*|.*[\s-]+[0-2]?[0-9]:([0-5][0-9]|XX)$/g); 
				// `/TIME_ON_START_OF_LINE|TIME_IN_MIDDLE_OF_LINE|TIME_AT_END_OF_LINE/g``

				if (lineTimeMarkerMatch) {
					const lineTimeMarker = lineTimeMarkerMatch[0]; // only first marker in line - this is opinionated assumption
					const isCompletedTask = lineTimeMarker.match(/^- \[[-xX]\]/);
					if (! isCompletedTask) {
						const formattedText = lineTimeMarker.
							replace(/([^0-9])([0-9]{1}):([0-9]{2})/g, "$10$2:$3"). // convert H:MM to HH:MM
							replace(/^- /, "").replace(/^\[.\] /, ""). // remove task list prefixes (`- [ ] `)
							replace(/`/g, ""); // remove backticks
						
						const timeRaw = lineTimeMarker.match(/[0-9]{1,2}:([0-9]{2}|XX)/)[0];
						const time = formattedText.match(/[0-9]{2}:([0-9]{2}|XX)/)[0];

						let pos = lineTimeMarker.indexOf(timeRaw)+timeRaw.length;
						if (pos<lineTimeMarker.length) { 
							pos++; // only set cursor one character after time if time was not the last thing in line
						}

						const timeMarker = {
							leafID: leafID,
							line: lineNum,
							ch: pos,
							time: time,
							formattedText: formattedText,
						}

						timeMarkers.push(timeMarker);
					}
				}
			}

			const sortedTimeMarkers = timeMarkers.sort((a,b) => {
				if (a.time > b.time) {
					return 1;
				}

				if (a.time < b.time) {
					return -1;
				}

				return 0;
			});

			sortedTimeMarkers.forEach(function (timeMarker) {
				const link = container.createEl("li", { }).
					createEl("a", { 
						text: timeMarker.formattedText, 
						href: "#",
					}
				);

				link.onClickEvent(() => {
					this.jumpToLine(leafID, timeMarker.line, timeMarker.ch);
				});
			}, this);
		}
		catch (exc) {
			console.error(exc);
		}

	}
	delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}
	async onOpen() {
		this.initView();

		this.registerEvent(this.app.workspace.on('file-open', () => {
			this.parseNote();
		}));
		this.registerEvent(this.app.workspace.on('editor-change', () => {
			this.parseNote();
		}));
	}

	async onClose() {
		// Nothing to clean up.
	}
}