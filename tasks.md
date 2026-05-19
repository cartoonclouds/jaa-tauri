TODO:

- Onboarding stepper ATS CV parsing https://chatgpt.com/share/6a0c8be1-c9b0-8393-8285-856aff2a7ae3

- Create a layout spliting the window vertically into two sides. Add a vertical bar to allow each side to be resized. Use https://primevue.org/splitter/

- Create a feature/domain using a datatable to list all job application, use pagination (https://primevue.org/paginator/) and https://primevue.org/datatable/

- Stats card

- Applications
  \*\* Progress - stages
- Given url fetch image to represent business

- Search

Application schema

- Description
- Interview process - what stage
- Benefits
- Salary range
- Location (Add googlemaps to show pins of applied. colour based of stage)
- Attendance type: hybrid, on-site, remote
- Enviroment type - part-time, contract, internship, full-time, volunteer
-

Create a feature/module which will display all interactions a job finder has had with regards to a job application. Use https://primevue.org/tree/. Allow each entry to be editable on double-click (in a modal). The depths can be of any length

---

Update all readme files with latest changes

Create a Mermaid diagram of how each elements of this app interaction. Add to the toplevel README.md

https://v2.tauri.app/develop/updating-dependencies/

Install and configure the Tauri plugin `@hypothesi/tauri-mcp-server`

`tauri-apps/plugins-workspace`

Stepper on first load to enter user profile details, use https://primevue.org/stepper/. Save the data using the Tauri package https://v2.tauri.app/plugin/store/ - install and configure this new package.

**Should be in its own module**
