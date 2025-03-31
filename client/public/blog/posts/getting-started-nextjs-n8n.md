---
title: Getting Started with Next.js and n8n
description: Learn how to integrate Next.js with n8n for powerful workflow automation
date: 2023-09-15
tags: ["Next.js", "n8n", "Automation", "Tutorial"]
image: /blog/posts/images/nextjs-n8n.jpg
---

# Getting Started with Next.js and n8n

Next.js is a powerful React framework that enables developers to build server-rendered applications with ease. n8n, on the other hand, is a workflow automation tool that allows you to connect various services and automate workflows. In this tutorial, we'll explore how to integrate these two technologies to create a powerful, automated web application.

![Next.js and n8n integration](/blog/posts/images/nextjs-n8n.jpg)

## What is n8n?

n8n (pronounced "n-eight-n") is an extendable workflow automation tool that allows you to connect various services and apps to create automated workflows. It is designed to be:

- **Open-source**: n8n is available under a fair-code license
- **Self-hostable**: You can run n8n on your own servers
- **Extensible**: You can create custom nodes and integrations
- **Visual**: The workflow editor provides a visual interface for creating workflows

n8n makes it easy to create workflows that connect different services and trigger actions based on events. For example, you could create a workflow that:

1. Monitors a Twitter hashtag
2. Extracts important information
3. Stores it in a database
4. Sends a notification to your team

![n8n Workflow Automation Dashboard](/blog/posts/images/automation-dashboard.jpg)

## Why integrate Next.js with n8n?

Integrating Next.js with n8n allows you to:

- Create custom UIs for your workflows
- Trigger workflows from user actions
- Display workflow results in a user-friendly way
- Build a complete solution that combines automation with a great user experience

## Setting up your environment

Before we begin, make sure you have the following installed:

- Node.js (version 14 or later)
- npm or yarn
- Git (optional, but recommended)

### Step 1: Set up n8n

First, let's set up n8n. You can install it globally using npm:

```bash
npm install -g n8n
```

Once installed, you can start n8n with:

```bash
n8n start
```

This will start the n8n server, and you can access the editor at `http://localhost:5678`.

### Step 2: Create a Next.js app

Next, let's create a new Next.js application:

```bash
npx create-next-app n8n-nextjs-integration
cd n8n-nextjs-integration
```

This will create a new Next.js app and navigate to its directory.

### Step 3: Install required packages

We'll need a few additional packages for our integration:

```bash
npm install axios swr
```

## Creating an API endpoint to trigger n8n workflows

Now, let's create an API endpoint in our Next.js app that can trigger n8n workflows. Create a new file at `pages/api/trigger-workflow.js` with the following content:

![Code Example](/posts/images/code-example.jpg)

```javascript
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { workflowId, data } = req.body;

  if (!workflowId) {
    return res.status(400).json({ message: 'Workflow ID is required' });
  }

  try {
    // Replace with your n8n instance URL
    const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
    const webhookPath = `/webhook/${workflowId}`;
    
    // Trigger the n8n workflow
    const response = await axios.post(`${n8nUrl}${webhookPath}`, data);
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return res.status(500).json({ 
      message: 'Failed to trigger workflow',
      error: error.message 
    });
  }
}
```

## Conclusion

In this tutorial, we've covered the basics of integrating Next.js with n8n. We've created a Next.js application that can trigger n8n workflows and display the results. This is just the beginning of what's possible with this integration.

By combining the power of Next.js for frontend development with n8n for workflow automation, you can build sophisticated applications that automate complex processes while providing a great user experience.

Happy coding! 