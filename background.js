document.getElementById("copyButton").addEventListener("click", function () {
  handleAction(copyToClipboard);
  changeButtonTextTemporarily("copyButton", "Copied!");
});

document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    handleAction(saveToFile);
    changeButtonTextTemporarily("downloadButton", "Downloaded!");
  });

function handleAction(actionCallback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (!tab.url.startsWith("https://intranet.alxswe.com/projects/")) {
      showPopup("This is not an ALX project page! 🐞");
      return;
    }
    try {
      chrome.tabs.executeScript(
        tab.id,
        {
          code: `
            var projectName = document.title.split(" | ")[0];
            var tasks = [];
            var learningObjectives = [];
            var resources = [];
            
            document.querySelectorAll('div[id^="task-num"]').forEach(taskDiv => {
              const title = taskDiv.querySelector('h3.panel-title')?.outerText;
              const task_type = taskDiv.querySelector('span.label.label-info')?.outerText;
              const files = taskDiv.querySelector('div.list-group-item ul li:nth-child(3) code')?.outerText;
              const files_array = files ? files.split(", ") : null;
              tasks.push({ title, task_type, files: files_array });
            });
  
            document.querySelectorAll('h2').forEach(h2 => {
              if (h2.textContent.includes("Learning Objectives")) {
                h2.nextElementSibling.nextElementSibling.nextElementSibling.querySelectorAll("li").forEach(li => {
                  learningObjectives.push(li.innerHTML);
                });
              }
              if (h2.textContent.includes("Resources")) {
                h2.nextElementSibling.nextElementSibling.querySelectorAll("li").forEach(li => {
                  const link = li.querySelector("a");
                  const url = link?.href || "";
                  const title = link?.title || li.textContent;
                  resources.push({ resource: title, link: url });
                });
              }
            });
  
            [projectName, tasks, learningObjectives, resources];
          `,
        },
        function (results) {
          var projectName = results[0][0];
          var tasks = results[0][1];
          var learningObjectives = results[0][2];
          var resources = results[0][3];

          var copiedText = `# ${projectName}\n\n`;

          if (resources.length !== 0) {
            copiedText += "## Resources\n\n";
            copiedText += "#### Read or watch:\n\n";
            resources.forEach(function (obj) {
              copiedText += `* [${obj.resource}](${obj.link})\n`;
            });
          }

          if (learningObjectives.length !== 0) {
            copiedText += "## Learning Objectives\n\n";
            copiedText += "### General\n\n";
            learningObjectives.forEach(function (obj) {
              copiedText += "* " + obj + "\n";
            });
          }

          copiedText += "## Tasks\n\n";
          copiedText += "| Task | File |\n";
          copiedText += "| ---- | ---- |\n";

          tasks.forEach(function (task) {
            let string_files = "";
            if (task.files) {
              task.files.forEach((file) => {
                string_files += `[${file}](./${file}), `;
              });
              string_files = string_files.slice(0, -2);
            } else {
              string_files = "[SOON](./)";
            }
            copiedText += `| ${task.title} | ${string_files} |\n`;
          });
          if (copiedText.length === 0) {
            showPopup("Nothing found to scan 😫");
            return;
          }
          actionCallback(copiedText);
        }
      );
    } catch (e) {
      showPopup("Something went wrong, Try again! 🐞");
    }
  });
}

function saveToFile(text) {
  var blob = new Blob([text], { type: "text/plain" });
  var fileName = "README.md";
  var downloadLink = document.createElement("a");
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

function showPopup(message) {
  var popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.display = "block";
  setTimeout(function () {
    popup.style.display = "none";
  }, 3000);
}

function changeButtonTextTemporarily(buttonId, newText) {
  var button = document.getElementById(buttonId);
  var originalText = button.textContent;
  button.textContent = newText;
  setTimeout(function () {
    button.textContent = originalText;
  }, 3000);
}
