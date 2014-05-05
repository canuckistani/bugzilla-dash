# Bugzilla Dash

An opinionated app That gives you some pretty graphs / overview of a bugzilla-based project (based on some opinions about how to use bugzilla).

Dependencies, probably localForage, async, underscore, bootstrap.

Getting set up:

1. clone or download source
2. start a server in that directory eg python -m SimpleHTTPServer
3. visit [http://localhost:8000/]
4. for 'Tracking bug ID' enter `980408`or `https://bugzilla.mozilla.org/show_bug.cgi?id=980408`, hit Enter
5. => *reticulating splines*
6. A nice chart showing bug meta-data and progress.