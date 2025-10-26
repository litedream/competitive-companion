import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LuoguProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Luogu').setUrl(url);

    if (elem.querySelector('.main-container') !== null) {
      this.parseFromPage(task, elem);
    } else {
      this.parseFromScript(task, elem);
    }

    return task.build();
  }

  private parseFromPage(task: TaskBuilder, elem: Element): void {
    task.setName(elem.querySelector('h1').textContent.trim().match(/^[A-Za-z]\d+/)[0]);

    const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    const memoryLimitAmount = parseFloat(memoryLimitStr.substring(0, memoryLimitStr.length - 2));
    const memoryLimitUnit = memoryLimitStr.substring(memoryLimitStr.length - 2);
    const memoryLimitConverted = memoryLimitUnit == 'MB' ? memoryLimitAmount : memoryLimitAmount * 1024;
    task.setMemoryLimit(Math.floor(memoryLimitConverted));

    elem.querySelectorAll('.io-sample').forEach(sample => {
      const blocks = sample.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });
  }

  private parseFromScript(task: TaskBuilder, elem: Element): void {
    const script = elem.querySelector('#lentille-context').textContent;
    const data = JSON.parse(script).data.problem;

    task.setName(`${data.pid} ${data.title}`.trim());

    task.setTimeLimit(Math.max(...data.limits.time));
    task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

    for (const sample of data.samples) {
      task.addTest(sample[0], sample[1]);
    }
  }
}
