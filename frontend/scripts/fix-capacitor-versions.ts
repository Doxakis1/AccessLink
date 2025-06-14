import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Define the target Capacitor version
const TARGET_VERSION = "5.5.1"

// Read package.json
const packageJsonPath = path.join(process.cwd(), "package.json")
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

// Update Capacitor dependencies
const capacitorDeps = ["@capacitor/android", "@capacitor/ios", "@capacitor/core", "@capacitor/cli"]

let hasChanges = false

// Update dependencies
if (packageJson.dependencies) {
  for (const dep of capacitorDeps) {
    if (packageJson.dependencies[dep] && packageJson.dependencies[dep] !== TARGET_VERSION) {
      console.log(`Updating ${dep} from ${packageJson.dependencies[dep]} to ${TARGET_VERSION}`)
      packageJson.dependencies[dep] = TARGET_VERSION
      hasChanges = true
    }
  }
}

// Update devDependencies
if (packageJson.devDependencies) {
  for (const dep of capacitorDeps) {
    if (packageJson.devDependencies[dep] && packageJson.devDependencies[dep] !== TARGET_VERSION) {
      console.log(`Updating ${dep} from ${packageJson.devDependencies[dep]} to ${TARGET_VERSION}`)
      packageJson.devDependencies[dep] = TARGET_VERSION
      hasChanges = true
    }
  }
}

// Write updated package.json if changes were made
if (hasChanges) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log("package.json updated with consistent Capacitor versions")

  // Install updated dependencies
  console.log("Installing updated dependencies...")
  execSync("npm install", { stdio: "inherit" })
} else {
  console.log("All Capacitor packages are already at the target version")
}

// Clean Capacitor
console.log("Cleaning Capacitor...")
try {
  execSync("npx cap clean", { stdio: "inherit" })
} catch (error) {
  console.log("Error cleaning Capacitor, continuing anyway...")
}

console.log("Ready to add Android platform. Run:")
console.log("npx cap add android")
