chrome.browserAction.onClicked.addListener((tab) => {
    if (tab.url.startsWith('https://intranet.alxswe.com/projects/')) {
        chrome.tabs.executeScript(tab.id, {code: `(${extractProjectDetails})()`}, results => {
            const projectName = results[0][0];
            const tasks = results[0][1]
            const learningObjectives = results[0][2];
            const resources = results[0][3];
            let readmeContent = `# ${projectName}\n\n`

            if (resources) {
                readmeContent += "## Resources\n\n";
                readmeContent += "#### Read or watch:\n\n";
                resources.forEach((obj) => {
                    readmeContent += `* [${obj.resource}](${obj.link})\n`;
                });
            }

            if (learningObjectives) {
                readmeContent += "## Learning Objectives\n\n"
                readmeContent += "### General\n\n";
                learningObjectives.forEach(function (obj) {
                    readmeContent += "* " + obj + "\n";
                });
            }

            if (tasks) {
                readmeContent += "## Tasks\n\n";
                readmeContent += "| Task | File | Mode |\n";
                readmeContent += "| ---- | ---- | ---- |\n";

                tasks.forEach(function (task) {
                    let string_files = "";
                    if (task.taskFileName) {
                        const fileName = task.taskFileName.split(', ')
                        fileName.forEach((file) => {
                            string_files += `[${file}](${file}), `;
                        })
                        string_files = string_files.slice(0, -2)
                    } else {
                        string_files = "[SOON]()"
                    }
                    readmeContent += `| ${task.taskTitle} | ${string_files} | ${task.taskMode} |\n`;
                });
            }
            copyToClipboard(readmeContent);
            saveToFile(readmeContent);
        });
    }
});

function extractProjectDetails() {
    const headers = document.querySelectorAll('h2');

    function getProjectName() {
        return document.title.split(": ")[1].split(" |")[0];
    }

    function getTasks() {
        const tasks = [];
        const tasksCards = document.querySelectorAll('div[id^="task-num"]')

        tasksCards.forEach(taskCard => {
            const taskTitle = taskCard.querySelector('h3.panel-title').outerText;
            const taskMode = taskCard.querySelector('span.label.label-info').outerText;
            const taskFileName = taskCard.querySelector('div.list-group-item ul li:last-child code').outerText;

            tasks.push({
                taskTitle: taskTitle,
                taskMode: taskMode,
                taskFileName: taskFileName
            });
        });

        return tasks;
    }

    function getLearningObjectives() {
        const objectivesSection = Array.from(headers).find(header => header.textContent.includes('Learning Objectives'));
        const objectivesList = objectivesSection.nextElementSibling.nextElementSibling.nextElementSibling.querySelectorAll('li');
        return Array.from(objectivesList).map(li => li.innerHTML);
    }

    function getResources() {
        const resourcesSection = Array.from(headers).find(header => header.textContent.includes('Resources'));
        const resourcesList = resourcesSection.nextElementSibling.nextElementSibling.querySelectorAll('li');
        return Array.from(resourcesList).map(li => {
            const link = li.querySelector("a");
            const href = link && link.href ? link.href : "";
            const title = link && link.title ? link.title : li.textContent;
            return {resource: title, link: href};
        });
    }

    const projectName = getProjectName();
    const tasks = getTasks();
    const learningObjectives = getLearningObjectives();
    const resources = getResources();

    return [projectName, tasks, learningObjectives, resources]
}

function saveToFile(text) {
    const blob = new Blob([text], {type: 'text/plain'});
    const fileName = 'README.md';
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
}

function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}
