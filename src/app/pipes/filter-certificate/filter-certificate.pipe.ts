import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCertificate'
})
export class FilterCertificatePipe implements PipeTransform {

  transform(value: any, filterString: string): unknown {
    filterString = filterString.trim();
    if (value.length === 0 && filterString === '') {
      return value;
    }

    return value.filter((item: any) => item?.credential_schema?.name?.toLowerCase().includes(filterString.toLowerCase()))
  }

}
