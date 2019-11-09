import ts from "typescript";

export function watch(options: WatchOptions): void {
    const { configPath } = options;

    const compilerOptions: ts.CompilerOptions = {
        incremental: true
    };

    const host = ts.createWatchCompilerHost(configPath, compilerOptions, ts.sys);

    const originalResolveModuleNames = host.resolveModuleNames;
    host.resolveModuleNames = (moduleNames, containingFile, reusedNames, redirectedReference, options) => {
        console.log("resolveModuleNames:", moduleNames, "containingFile:", containingFile);

        if (originalResolveModuleNames !== undefined) {
            return originalResolveModuleNames(moduleNames, containingFile, reusedNames, redirectedReference, options);
        }

        return moduleNames.map(name => ts.resolveModuleName(name, containingFile, options, host, undefined, redirectedReference).resolvedModule);
    };

    const originalAfterProgramCreate = host.afterProgramCreate;
    host.afterProgramCreate = program => {
        program.getSourceFiles()
            .filter(f => !f.isDeclarationFile)
            .forEach(f => {
                console.log("name:", f.fileName);
                console.log("deps:", program.getAllDependencies(f));
            });

        originalAfterProgramCreate?.(program);
    };

    const program = ts.createWatchProgram(host);
}

interface WatchOptions {
    inputPath: string;
    outputPath: string;
    configPath: string;
}

watch({
    inputPath: "./agent.ts",
    outputPath: "./_agent.js",
    configPath: "./tsconfig.json"
});
