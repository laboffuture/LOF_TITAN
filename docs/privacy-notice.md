# Privacy Notice: LOF TITAN kit modules in your LMS

**Version 0.1 (draft) · Effective [date]**

How the LOF TITAN robotics kit module handles student data when it is embedded as a
course activity, what leaves the browser, and what does not.

> **This is a draft for legal review, not legal advice.** Every technical statement
> below was checked against the LOF TITAN source code and is accurate as of this
> version. Everything marked `[like this]` is a decision only your organisation can
> make — legal entity, contact points and retention periods. Have a qualified
> adviser review it before you publish it to schools.

---

## 1. Who we are and what this covers

`[Legal entity name]` ("we") publishes LOF TITAN, a robotics learning platform built
around the ESP32-S3 TITAN board. This notice explains what happens to personal data
when a LOF TITAN kit module is placed inside your learning management system as an
embedded activity.

There are two distinct situations, and they handle data very differently:

- **The embedded kit module** — a single kit shown inside an LMS course page, for
  example `/embed/kit/invisible-line`. There is no LOF TITAN sign-in and no LOF TITAN
  account. This is what sections 3 to 7 describe.
- **The full LOF TITAN platform** — the standalone site where learners have their own
  account. Section 8 describes it. It applies to you only if your learners use accounts.

## 2. The short version

| | |
|---|---|
| **Accounts in the module** | None. Students are never asked to register or sign in. |
| **Analytics and tracking** | None. No analytics, advertising, tracking pixels or profiling of any kind. |
| **Cookies set by the module** | None. |
| **Identity from your LMS** | None is passed to us. We do not learn who the student is. |
| **Student work** | Saved in the student's own browser, on their device. We never receive it. |
| **Robot connection** | Direct from the browser to the board. Nothing about it is sent to us. |

The embedded module is, in data protection terms, close to a page of course material
that happens to be interactive. The one unavoidable exception is the ordinary network
traffic described in section 4.

## 3. The embedded kit module: what we collect

**We collect no personal data through the embedded module.** Specifically, the module
does not ask for and does not receive:

- names, email addresses, usernames or student identifiers;
- your LMS account details, class lists or grades;
- progress, scores or completion data;
- any account with us — there is nothing to sign in to in this mode.

There is no analytics or advertising code in the module, and no behavioural profiling.
We verified this against the source: the application contains no analytics library, tag
manager, advertising script or session-recording tool.

The module also makes no calls to LOF TITAN's own servers while a student uses it. The
kit guide, wiring diagrams, code and the block editor are all delivered as part of the
page itself and run entirely in the browser.

## 4. Who receives data when the page loads

Loading any web page means the browser must connect to the servers that hold it. Those
connections carry the student's IP address and browser information, as they do for every
website. These are the only recipients, and none of them receive anything about the
student beyond that ordinary request data.

| Recipient | Why | What it receives |
|---|---|---|
| **GitHub Pages** (github.io) | Hosts the module's page and program code. | IP address, browser and device type, page requested, time. |
| **Cloudinary** (res.cloudinary.com) | Delivers kit photographs and diagrams. | IP address, browser and device type, images requested, time. |
| **Google Fonts** (fonts.googleapis.com, fonts.gstatic.com) | Supplies the two typefaces the page uses. | IP address, browser and device type, time. |

> **Decision for your team.** Some European schools object to Google Fonts being loaded
> from Google's servers, because the request discloses the student's IP address to a
> third country. German courts have ruled against sites doing this without consent.
> If you expect EU learners, ask us to bundle the fonts with the page instead. It is a
> small change, it removes Google from this table entirely, and it makes the page load
> slightly faster.

## 5. What stays on the student's device

The module saves a student's work in their own browser so it survives a page reload.
This storage belongs to the student's browser profile on their own computer. It is never
transmitted to us, and we have no way to read it.

| Name | Holds | Lasts |
|---|---|---|
| `titan_auto_workspace` | The blocks currently on the student's Block Code Studio canvas. | Until the browser's site data is cleared. |
| `titan_saved_project` | A project the student chose to save. | Until the browser's site data is cleared. |
| `titan_gemini_model` | Which AI model the student last selected. | Until the browser's site data is cleared. |
| `titan_embed_kit` | Which kit this course page is showing, so a reload stays on it. | Until the browser tab is closed. |

None of these are cookies, none are used for tracking, and none identify the student.
Clearing the browser's site data removes them, and with them any unsaved project work.

## 6. Connecting the robot: USB and Bluetooth

To program the TITAN board, the module uses the browser's own USB (Web Serial) and
Bluetooth features. Three things are worth stating plainly for schools:

- **The student is always asked first.** The browser shows its own device chooser, and
  the page gets access only to the one device the student picks. We cannot open a
  connection silently, and we cannot see any other device.
- **The connection is direct.** Program code travels from the browser to the board over
  the cable or the Bluetooth link. It does not pass through our servers, and nothing
  about the board or the connection is reported back to us.
- **Access ends with the page.** Closing or navigating away from the course page ends
  the connection.

These features exist only in Chromium-based browsers such as Chrome and Edge. In other
browsers the kit guide, the block editor and the simulator still work; only the physical
board connection is unavailable.

## 7. AI Studio

**AI Studio is switched off in the embedded module.** A student who opens it sees a
message saying it is unavailable. No prompt, no code and no message is sent anywhere.

On the full platform, where a learner is signed in, AI Studio works as follows. It
matters for a school assessment, so it is stated here in full:

- The learner's question and the current conversation are sent to our server, and from
  our server to Google's Gemini API.
- The request is made by our server, not by the learner's browser, so **the learner's IP
  address is never disclosed to Google**. Google sees our server.
- We send only the conversation text and the chosen model. We do not attach the
  learner's name, email or account identifier.
- Learners should still be told not to type personal information into any AI assistant.
  `[Add your acceptable-use wording here.]`

## 8. Accounts on the full platform

This section applies only where learners use LOF TITAN accounts rather than the embedded
module. It is included so your assessment covers both.

### Account records

An account holds the email address, a display name, a one-way encrypted password, the
kits the account owns, and the date it was created. Sessions use a cookie that cannot be
read by page scripts and expires after seven days.

### Access log

When a signed-in learner opens kit content, the platform records an entry so we can
support the account and see which cities to run events in.

| Field | Example purpose | Nature |
|---|---|---|
| Time, kit opened, allowed or refused | Support, and checking that paid content is protected. | Not identifying |
| Account identifier and email address | Tying the entry to the right account. | Personal data |
| IP address and browser identification | Security, abuse investigation. | Personal data |
| Approximate city, region and country | Deciding where to hold workshops and hackathons. | Personal data |

The location is worked out **on our own server**, from an offline database shipped with
the software. No third-party location service is contacted and no IP address is sent
outside our system for this. The result is city-level and approximate: it reflects where
the internet provider routes the connection, not where the person is. It is used in
aggregate, to count how many learners are active in a city.

> **Known gap — fix before launch.** The access log currently stores full IP addresses
> and keeps every entry indefinitely. For a product used mainly by minors, we recommend
> shortening or removing the IP address once the location has been derived, and deleting
> entries automatically after `[90 days]`. Decide this before the platform goes live with
> real learners, and update section 11 to match.

## 9. Children's data

LOF TITAN is used in schools, so many learners are under 18. Two consequences follow, and
the embedded module was designed with them in mind.

**India — Digital Personal Data Protection Act, 2023.** Processing a child's personal
data requires verifiable consent from a parent or guardian, and the Act prohibits
tracking, behavioural monitoring and targeted advertising directed at children. The
embedded module does none of these things: it has no accounts, no tracking and no
advertising, and collects no personal data at all.

**Outside India.** If you enrol learners in the EU or UK, the GDPR treats an IP address
as personal data, so section 4 is the part that matters there; if learners in the United
States are under 13, COPPA applies to your school's decision to use the tool.

> **Decision for your team.** Confirm with your adviser whether your school agreements
> already cover consent for course materials of this kind, or whether the LMS needs to
> gather it separately. `[Record the answer here.]`

## 10. Who is responsible for what

| Situation | Your institution | Us |
|---|---|---|
| Embedded kit module | Decides to place the activity in a course; holds the learner relationship and all learner records. | Supplies the course material. Receives no learner data. |
| Full platform accounts | Decides which learners get access. | Holds the account, the access log and the kit entitlements described in section 8. |

Your LMS remains responsible for its own sign-in, its own cookies and its own records.
This notice does not describe your LMS, and it does not replace your institution's own
privacy notice.

## 11. How long we keep data

| Data | Kept for |
|---|---|
| Anything from the embedded module | Nothing is collected, so nothing is kept. |
| Work saved in the student's browser | Until the student or the school clears the browser's site data. Under their control, not ours. |
| Account records (full platform) | `[e.g. until the account is deleted, then 30 days]` |
| Access log (full platform) | `[e.g. 90 days]` — see the gap noted in section 8. |
| Server and hosting logs | `[confirm with your hosting provider]` |

## 12. How we protect data

- Passwords are stored only as a one-way hash; we cannot read them.
- Session cookies cannot be read by page scripts, and expire after seven days.
- Sign-in, registration, kit redemption and AI requests are rate limited against abuse.
- Whether an account may open a kit is checked on the server every time, never in the browser.
- Location is derived on our own server from an offline database, so no IP address is
  sent to a third-party lookup service.
- Staff access to the administration area is checked against the database on every request.

## 13. Your rights and how to contact us

Learners and guardians may ask for a copy of their personal data, ask for it to be
corrected or deleted, or object to how it is used. Where the data sits with your
institution, the request belongs with them; where it sits with us, contact us directly.

- **Privacy contact:** `[privacy@yourcompany.com]`
- **Grievance Officer (required under the Indian DPDP Act):** `[name and contact]`
- **Postal address:** `[registered office address]`
- **We respond within:** `[e.g. 30 days]`

## 14. Changes to this notice

We update this notice when the product changes. Two changes are already expected and will
require a new version:

1. **Single sign-on from your LMS.** When the module accepts a signed sign-in from your
   LMS, we will start receiving a learner identifier and the kits they are entitled to.
   That is a material change, and this notice will be revised before it is switched on.
2. **Kit content served from our server.** Course content is currently delivered as part
   of the page. When it moves behind a sign-in check, requests will be recorded as
   described in section 8.

The version and effective date at the top of this notice tell you which text applies.

## 15. Before you publish this notice

Everything below needs an answer from your organisation. None of it can be filled in from
the software.

1. Legal entity name, registered address and effective date (sections 1 and 13).
2. Privacy contact address and the Grievance Officer required by the DPDP Act (section 13).
3. Retention periods, and the access log decision flagged in section 8 (section 11).
4. Whether to bundle the fonts, if EU learners are in scope (section 4).
5. How consent for under-18 learners is obtained in your school agreements (section 9).
6. Your acceptable-use wording for AI Studio (section 7).
7. A qualified legal review of the finished text.

---

Prepared for `[Legal entity name]` as a draft. Technical statements describe LOF TITAN as
built at version 0.1 of this notice and were verified against the application's source
code, including its third-party requests, browser storage, device permissions and
server-side records.
