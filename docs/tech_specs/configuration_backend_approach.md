- Feature Name: `select_backend_approach_for_screenplay_configuration`
- Start Date: 2023-07-27
- RFC PR
- Asana task: [[Screenplay] Brainstorm: configuring screens](https://app.asana.com/0/1185117109217413/1205058023431637/f)
- Status: Proposed

# Summary/Motivation

The Screens team is working to build out a new tool within Screenplay for managing screen configurations, effectively replacing the current Screens Admin Tool.

The Screenplay Configuration Tool will need knowledge of the shape of the configuration for each screen type in order to be able to validate and write the configuration to the data store, currently a JSON file in S3. The challenge here is that the code that defines these shapes lives in and is used by the Screens application and now needs to also be referenced by Screenplay.

The expected outcome of this document is to outline a few reasonable solutions for overcoming this hurdle and having the engineering team come to a consensus on an approach.

Note: This document will not go into any lower-level implementation details for the Screenplay Configuration tool and will only focus on selecting an architectural approach for enabling Screenplay to reference code from Screens.

# Possible approaches and rationale

## 1. Umbrella Project

### Description

An Umbrella Project would allow us to group Screens and Screenplay in a single, unified codebase while still maintaining and deploying them as distinct applications. A dependency on Screens from Screenplay can then be defined and the code can be shared. Or the shared code can be separated into its own app within the umbrella and both applications can define a dependency on it.

### High-level steps to get there

- Create new umbrella project using `mix new` with `--umbrella` flag
- Move Screens and Screenplay to `apps` folder in new umbrella project
- Separate shared code into a new application within `apps` folder
- Update `mix.exs` files to match umbrella structure and add dependency on new app with shared code to Screens and Screenplay's `mix.exs` files
- Update deployment scripts for both projects to account for new Umbrella structure
- Begin referencing shared code in Screenplay

### Benefits

Umbrella projects are a widely discussed topic within the Elixir community. Apart from enabling the primary goal of facilitating code-sharing between applications, some of the benefits that proponents of the approach claim seem to generally be the benefits of structuring your project as a monorepo, but perhaps with better ways to draw boundaries between applications under the umbrella.

Some of the general benefits are easier code navigation and less context switching since everything lives in the same repository. It also makes dependency and version management a bit more streamlined. An umbrella project can also enable fully integrated testing possibilities between the various applications.

### Drawbacks

The most obvious drawback here is that there is a fair amount of upfront effort to set up the umbrella project and fully migrate both Screens and Screenplay to the umbrella before we can do any meaningful amount of work on the new configuration tool. Umbrella projects also don’t seem to be terribly common in the larger Elixir community which could make it difficult to find support when needed and some tools (such as Lvoc) don’t play nicely with umbrella projects as reported by the dotcom team.

Overall, drawbacks of an umbrella project depends largely on our specific goals and needs. Umbrella projects seem to encourage more code sharing and therefore seem to be better suited for when you want to manage multiple, closely integrated applications. Moving things to an umbrella project may also induce an unnecessary initial learning curve as developers will need to learn about and adjust to working with the new structure.

Moving/converting one or both projects for the umbrella may also cause us to lose the git history of either Screenplay or Screens.

### References

https://elixir-lang.org/getting-started/mix-otp/dependencies-and-umbrella-projects.html

## 2. Library Dependency

### Description

The library approach would allow code to be shared between the two applications while keeping the codebases separate. The shared code would be separated out into its own library application and published as a Hex package for Screenplay to add as dependency and use.

### High-level steps to get there

- Create new library application
- Move shared code into library
- Publish to Hex
- Add Hex package as a dependency in Screens and Screenplay’s `mix.exs` files
- Fetch dependencies and start referencing Screens code

### Benefits

Setting up the shared code as a separate library and importing it as a package into Screenplay is a less intrusive solution since Screens and Screenplay will remain as separate projects. It also encourages a more modular structure and clearer separation of concerns. This approach is also arguably a more intuitive way of sharing code between projects and would therefore be less likely to be disruptive to the team and it’s workflow. A library also offers more flexibility since upgrades can be managed independently and an update to the shared code won’t trigger an automatic update to all repos to reference it.

### Drawbacks

While a library does enable greater flexibility in terms of version management, it also requires extra effort to do the management.

### References

https://hexdocs.pm/elixir/main/library-guidelines.html

## 3. Git Dependency

### Description

Elixir also supports adding a GitHub repository directly as a dependency to your project. You can also pin the dependency to specific tags/commits/branches as well.

### High-level steps to get there

- Add the git dependency to the deps in Screenplay’s `mix.exs` file
- Fetch dependencies and start referencing Screens code

### Benefits

This method is the least intrusive and easiest as it requires a trivial amount of upfront work to enable Screenplay to reference the code from Screens. It also requires no changes to the Screens application since we don’t need to move the shared code anywhere. We also have some of the same flexibility as the library approach since we can pin Screenplay to a specific version of Screens.

### Drawbacks

One problem with this approach is that there are no enforceable boundaries. In other words, there is nothing preventing Screenplay from referencing code anywhere in Screens.

### References

https://hexdocs.pm/mix/1.12.3/Mix.Tasks.Deps.html

# Recommendation

The approach I recommend is number 2, the library approach. This approach requires some upfront work to set up like the umbrella approach, but is less intrusive to our team’s workflow. Umbrella projects are more suited for cases where there are many, tightly integrated applications, which is not the case with Screens and Screenplay. In addition, setting up an umbrella project may backfire on us as it appears that it’s not a widely supported approach in the larger Elixir community and other teams within CTD have faced frustrations when using an umbrella, such as handy tools like Lcov being optimized for standard Elixir apps and not playing well with an umbrella setup.

While the git dependency would be the lowest hanging fruit in achieving our goal, we will lack the ability to maintain any boundaries between Screenplay and Screens which isn’t what we want since the majority of Screens code will not be needed by Screenplay.

The library approach is a familiar and well supported method and achieves our needs in a way that lets us mark clear boundaries between the applications. While this approach will introduce some level of overhead in maintaining dependencies, it also gives us flexibility if we need it.

# Selected Approach

After discussion, we've decided to go with a mixture of two approaches. We will separate out the config code into its own Github repository but use the git dependency approach to import the code to Screens and Screenplay. This achieves the benefits of the library approach while allowing us to skip publishing a package to Hex.
