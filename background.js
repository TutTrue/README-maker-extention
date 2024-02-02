chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => {
			let general, link, url, title, taskTitle, taskMode, taskFileName,
				readmeContent, fileName, string_files;
			let learningObjs = [], resources = [], tasks = [];
			const projName = document.title.split(': ')[1].split(' |')[0];
			const headers = document.querySelectorAll('h2');
			const tasksCards = document.querySelectorAll('div[id^=task-num]');

			for (const header of headers) {
				if (header.textContent.includes('Learning Objectives')) {
					general = header.nextElementSibling.nextElementSibling.nextElementSibling;
					general.querySelectorAll('li').forEach(li =>
						learningObjs.push(li.innerText)
					);
				}

				if (header.textContent.includes('Resources')) {
					general = header.nextElementSibling.nextElementSibling;
					general.querySelectorAll('li').forEach(li => {
						link = li.querySelector('a');
						url = link?.href || '';
						title = link?.title || li.textContent;
						resources.push({resource: title, link: url});
					});
				}
			}

			tasksCards.forEach(taskCard => {
				taskTitle = taskCard.querySelector('h3.panel-title').outerText;
				taskMode = taskCard.querySelector('span.label.label-info').outerText;
				taskFileName = taskCard.querySelector('div.list-group-item ul li:last-child code').outerText;
				tasks.push({
					taskTitle: taskTitle,
					taskMode: taskMode,
					taskFileName: taskFileName
				});
			});

			readmeContent = `# ${projName}\n\n`;

			readmeContent += '## Resources\n\n';
			readmeContent += '#### Read or watch:\n\n';
			resources.forEach((obj) => {
				readmeContent += `* [${obj.resource}](${obj.link})\n`;
			});

			readmeContent += '## Learning Objectives\n\n';
			readmeContent += '### General\n\n';
			learningObjs.forEach(function (obj) {
				readmeContent += '* ' + obj + '\n';
			});

			readmeContent += '## Tasks\n\n';
			readmeContent += '| Task | File | Mode |\n';
			readmeContent += '| ---- | ---- | ---- |\n';
			tasks.forEach(function (task) {
				string_files = '';
				fileName = task.taskFileName.split(', ');
				fileName.forEach(file => {
					string_files += `[${file}](./${file}), `;
				});
				string_files = string_files.slice(0, -2);
				readmeContent += `| ${task.taskTitle} | ${string_files} | ${task.taskMode} |\n`;
			});

			const blob = new Blob([readmeContent], {type: 'text/plain'});
			const readmeFile = 'README.md';
			const downloadLink = document.createElement('a');
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.download = readmeFile;
			downloadLink.click();

			const textArea = document.createElement('textarea');
			textArea.value = readmeContent;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	});
});
