var template = {};
// LaunchRequest template
template.launch = {
  "version": "1.0",
  "session": {
	"new": true,
	"sessionId": "amzn1.echo-api.session.abeee1a7-aee0-41e6-8192-e6faaed9f5ef",
	"attributes": {},
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
    },
	"user": {
	  "userId": "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
	}
  },
  "request": {
	"type": "LaunchRequest",
	"requestId": "amzn1.echo-api.request.9cdaa4db-f20e-4c58-8d01-c75322d6c423"
  }
};
// IntentRequest template
template.intent = {
  "version": "1.0",
  "session": {
	"new": false,
	"sessionId": "amzn1.echo-api.session.abeee1a7-aee0-41e6-8192-e6faaed9f5ef",
	"attributes": {},
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
    },
	"user": {
	  "userId": "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
	}
  },
  "request": {
	"type": "IntentRequest",
	"requestId": "amzn1.echo-api.request.6919844a-733e-4e89-893a-fdcb77e2ef0d",
	"intent": {
	  "name": "sampleIntent",
	  "slots": {
		"NAME": {
		  "name":"NAME",
		  "value":"Matt"
		}
	  }
	}
  }
};
// errorIntent template
template.errorIntent = {
  "version": "1.0",
  "session": {
	"new": false,
	"sessionId": "amzn1.echo-api.session.abeee1a7-aee0-41e6-8192-e6faaed9f5ef",
	"attributes": {},
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
    },
	"user": {
	  "userId": "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
	}
  },
  "request": {
	"type": "IntentRequest",
	"requestId": "amzn1.echo-api.request.6919844a-733e-4e89-893a-fdcb77e2ef0d",
	"intent": {
	  "name": "errorIntent",
	  "slots": {}
	}
  }
};
// missingIntent template
template.missingIntent = {
  "version": "1.0",
  "session": {
	"new": false,
	"sessionId": "amzn1.echo-api.session.abeee1a7-aee0-41e6-8192-e6faaed9f5ef",
	"attributes": {},
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
    },
	"user": {
	  "userId": "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
	}
  },
  "request": {
	"type": "IntentRequest",
	"requestId": "amzn1.echo-api.request.6919844a-733e-4e89-893a-fdcb77e2ef0d",
	"intent": {
	  "name": "missingIntent",
	  "slots": {}
	}
  }
};
// SessionEndedRequest template
template.session_end = {
  "version": "1.0",
  "session": {
	"new": false,
	"sessionId": "amzn1.echo-api.session.abeee1a7-aee0-41e6-8192-e6faaed9f5ef",
	"attributes": {},
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
    },
	"user": {
	  "userId": "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
	}
  },
  "request": {
	"type": "SessionEndedRequest",
	"requestId": "amzn1.echo-api.request.d8c37cd6-0e1c-458e-8877-5bb4160bf1e1",
	"reason": "USER_INITIATED"
  }
};
module.exports = template;
