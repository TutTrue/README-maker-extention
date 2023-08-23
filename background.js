chrome.browserAction.onClicked.addListener(function(tab) {
  if (tab.url.startsWith('https://intranet.alxswe.com/projects/')){
  chrome.tabs.executeScript(tab.id, {
    code: `
      var projectName = document.title.split(" | ")[0];
      var tasks = [];
      var files = [];
      var learningObjectives = [];
      var resources = [];
      
      const taskElements = document.querySelectorAll('div[id^="task-num"]')
      taskElements.forEach(taskDiv => {
        const title = taskDiv.querySelector('h3.panel-title')?.outerText;
        const task_type = taskDiv.querySelector('span.label.label-info')?.outerText;

        const files = taskDiv.querySelector('div.list-group-item ul li:nth-child(3) code')?.outerText;
        files_array = files?.split(", ");
        tasks.push({
          title: title,
          task_type: task_type,
          files: files_array
        });
      });

      var h2Elements = document.querySelectorAll('h2');

      for (var i = 0; i < h2Elements.length; i++) {
          if (h2Elements[i].textContent.includes("Learning Objectives")) {
            var general = h2Elements[i].nextElementSibling.nextElementSibling.nextElementSibling;
            general.querySelectorAll("li").forEach(li =>{
              learningObjectives.push(li.innerHTML);
            });
            break;
          }
      }

      var h2Elements = document.querySelectorAll('h2');

      for (var i = 0; i < h2Elements.length; i++) {
          if (h2Elements[i].textContent.includes("Resources")) {
            var general = h2Elements[i].nextElementSibling.nextElementSibling;
            general.querySelectorAll("li").forEach(li =>{
                var link = li.querySelector("a");
                var url = link && link.href ? link.href : "";
                var title = link && link.title ? link.title : li.textContent;

                resources.push({ resource: title, link: url });
            });
            break;
          }
      }

      [projectName, tasks, learningObjectives, resources];
    `
  }, function(results) {
    var projectName = results[0][0];
    var tasks = results[0][1];
    var learningObjectives = results[0][2];
    var resources = results[0][3];

    var copiedText = `# ${projectName}\n\n`;

    if (resources.length !== 0) {
      copiedText += "## Resources\n\n";
      copiedText += "#### Read or watch:\n\n";
      resources.forEach(function(obj){
        copiedText += `* [${obj.resource}](${obj.link})\n`;
      });
    }

    if (learningObjectives.length !== 0) {
      copiedText += "## Learning Objectives\n\n";
      copiedText += "### General\n\n";
      learningObjectives.forEach(function(obj) {
        copiedText += "* " + obj + "\n";
      });
    }

	  copiedText += "## Tasks\n\n";
    copiedText += "| Task | File |\n";
    copiedText += "| ---- | ---- |\n";

    tasks.forEach(function(task) {
      let string_files = "";
      if (task.files != null) {
        task.files.forEach((file)=>{
          string_files+= `[${file}](./${file}), `;
        })
        string_files = string_files.slice(0,-2)
      }
      else {
        string_files = "[SOON](./)"
      }
      copiedText += `| ${task.title} | ${string_files} |\n`;
    });

    copyToClipboard(copiedText);
    saveToFile(copiedText);
  });
  }
});

function saveToFile(text) {
  var blob = new Blob([text], { type: 'text/plain' });
  var fileName = 'README.md';
  var downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
}

function copyToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}
