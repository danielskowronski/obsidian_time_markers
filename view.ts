import { ItemView, WorkspaceLeaf } from "obsidian";
import { App, Plugin } from "obsidian";

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

	jumpToLine(leafID, line, ch){
		let editorObj=this.app.workspace.getLeafById(leafID).view.sourceMode.cmEditor;
		editorObj.focus();
		editorObj.setCursor({line: line, ch: ch});
	}

	parseNote(){
		window.APP = this.app; /* ugly debug */
		this.initView();

		try {
			const container = this.containerEl.children[1];
			const leafID = this.app.workspace.activeLeaf.id;

			let editorObj=this.app.workspace.activeLeaf.view.sourceMode.cmEditor;

			let timeMarkers = {}

			for (let lineNum=0; lineNum<editorObj.lineCount(); lineNum++){
				let lineText = editorObj.getLine(lineNum);
				let lineTimeMarkerMatch = lineText.match(/^[0-2]?[0-9]:[0-5][0-9]\s+.*|.*\s+[0-2]?[0-9]:[0-5][0-9]\s+.*|.*\s+[0-2]?[0-9]:[0-5][0-9]$/g); 
				// `/TIME_ON_START_OF_LINE|TIME_IN_MIDDLE_OF_LINE|TIME_AT_END_OF_LINE/g``
				// `TIME_...` is 24hrs time in HH:MM or H:MM form surrouned by whitespace or line start/end

				if (lineTimeMarkerMatch) {
					let lineTimeMarker = lineTimeMarkerMatch[0]; // only first marker in line - this is opinionated assumption
					let isCompletedTask = lineTimeMarker.match(/^- \[[\-xX]\]/);
					if (! isCompletedTask) {
						let formattedText = lineTimeMarker.
							replace(/([^0-9])([0-9]{1}):([0-9]{2})/g, "$10$2:$3"). // convert H:MM to HH:MM
							replace(/^- /, "").replace(/^\[.\] /, ""); // remove task list prefixes (`- [ ] `)
						
						let timeRaw = lineTimeMarker.match(/[0-9]{1,2}:[0-9]{2}/)[0];
						let time = formattedText.match(/[0-9]{2}:[0-9]{2}/)[0];

						let pos = lineTimeMarker.indexOf(timeRaw)+timeRaw.length;
						if (pos<lineTimeMarker.length) { 
							pos++; // only set cursor one character after time if time was not the last thing in line
						}

						let timeMarker = {
							leafID: leafID,
							line: lineNum,
							ch: pos,
							time: time,
							formattedText: formattedText,
						}

						timeMarkers[time] = timeMarker;
					}
				}
			}

			for (let [time, timeMarker] of Object.entries(timeMarkers)) {				
				let link = container.createEl("li", { }).
					createEl("a", { 
						text: timeMarker.formattedText, 
						href: "#"
					}
				);

				link.onClickEvent(() => {
					this.jumpToLine(leafID, timeMarker.line, timeMarker.ch)
				});
			}
		}
		catch (exc) {

		}

	}

	async onOpen() {
		this.parseNote();

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